import { config } from '../config'
import { db } from '../db'
import { verifyPow } from '../lib/pow'
import { getClientIp, json, type BunServer } from '../lib/http'
import { isRateLimited, registerAttempt } from '../lib/rate-limit'
import { sendToTelegram } from '../lib/telegram'

interface ContactBody {
    challengeId: string
    nonce: number
    name: string
    contact: string
    message: string
    website: string
    gesture: { durationMs: number; samples: number; distance: number }
    elapsedMs: number
    locale: string
}

function isString(v: unknown, min: number, max: number): v is string {
    return typeof v === 'string' && v.trim().length >= min && v.length <= max
}

function parseBody(raw: unknown): ContactBody | null {
    if (typeof raw !== 'object' || raw === null) return null
    const b = raw as Record<string, unknown>
    const gesture = (b.gesture ?? {}) as Record<string, unknown>

    if (!isString(b.challengeId, 8, 64)) return null
    if (typeof b.nonce !== 'number') return null
    if (typeof b.website !== 'string' || b.website.length > 500) return null

    return {
        challengeId: b.challengeId,
        nonce: b.nonce,
        name: typeof b.name === 'string' ? b.name.trim() : '',
        contact: typeof b.contact === 'string' ? b.contact.trim() : '',
        message: typeof b.message === 'string' ? b.message.trim() : '',
        website: b.website,
        gesture: {
            durationMs: typeof gesture.durationMs === 'number' ? gesture.durationMs : 0,
            samples: typeof gesture.samples === 'number' ? gesture.samples : 0,
            distance: typeof gesture.distance === 'number' ? gesture.distance : 0,
        },
        elapsedMs: typeof b.elapsedMs === 'number' ? b.elapsedMs : 0,
        locale: b.locale === 'en' ? 'en' : 'ru',
    }
}

/**
 * POST /api/contact — приём сообщения с формы.
 *
 * Жёсткие проверки (любая роняет запрос):
 *   1. лимит запросов с IP;
 *   2. одноразовый challenge: существует, не использован, не протух;
 *   3. proof-of-work решён верно;
 *   4. от выдачи challenge прошло больше 2 секунд — мгновенная отправка
 *      означает скрипт.
 *
 * Мягкие сигналы пишутся в spam_flags и уходят в Telegram как пометка:
 *   honeypot-заполнен (такое письмо вообще не отправляется), слабый жест
 *   слайдера. Сообщение в любом случае остаётся в SQLite.
 */
export async function handleContact(req: Request, server: BunServer): Promise<Response> {
    const ip = getClientIp(req, server)
    const userAgent = req.headers.get('user-agent') ?? ''

    if (isRateLimited(ip, 'contact', config.ratePerHour, config.ratePerDay)) {
        return json({ error: 'rate-limit' }, 429)
    }

    let body: ContactBody | null
    try {
        body = parseBody(await req.json())
    } catch {
        body = null
    }
    if (!body) return json({ error: 'validation' }, 400)

    registerAttempt(ip, 'contact')

    // одноразовость через UPDATE: повторное использование не пройдёт даже в гонке
    const consumed = db.run(
        'UPDATE challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND issued_at > ?',
        [Date.now(), body.challengeId, Date.now() - config.challengeTtlMs],
    )
    if (consumed.changes !== 1) return json({ error: 'captcha' }, 403)

    const challenge = db
        .query('SELECT salt, difficulty, issued_at FROM challenges WHERE id = ?')
        .get(body.challengeId) as { salt: string; difficulty: number; issued_at: number }

    if (!verifyPow(challenge.salt, body.nonce, challenge.difficulty)) {
        return json({ error: 'captcha' }, 403)
    }

    if (Date.now() - challenge.issued_at < config.minSubmitDelayMs) {
        return json({ error: 'captcha' }, 403)
    }

    if (!isString(body.name, 2, 100) || !isString(body.contact, 3, 150) || !isString(body.message, 10, 4000)) {
        return json({ error: 'validation' }, 400)
    }

    const spamFlags: string[] = []
    const isHoneypot = body.website.trim().length > 0
    if (isHoneypot) spamFlags.push('honeypot')
    if (body.gesture.samples > 0 && (body.gesture.durationMs < 120 || body.gesture.samples < 5)) {
        spamFlags.push('gesture-weak')
    }
    if (body.gesture.samples === 0) spamFlags.push('gesture-keyboard')

    const inserted = db.run(
        `INSERT INTO messages (name, contact, message, locale, ip, user_agent, spam_flags, delivered)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            body.name,
            body.contact,
            body.message,
            body.locale,
            ip,
            userAgent.slice(0, 300),
            JSON.stringify(spamFlags),
            isHoneypot ? -1 : 0, // -1: помечено как спам, не доставляем
        ],
    )

    // боту отвечаем «ок», чтобы не подсказывать, что его раскусили
    if (isHoneypot) return json({ ok: true })

    const delivered = await sendToTelegram({
        name: body.name,
        contact: body.contact,
        message: body.message,
        locale: body.locale,
        ip,
        spamFlags,
    })

    db.run('UPDATE messages SET delivered = ?, delivery_attempts = 1 WHERE id = ?', [
        delivered ? 1 : 0,
        inserted.lastInsertRowid,
    ])

    return json({ ok: true })
}

/** Фоновая дозагрузка: что не ушло в Telegram сразу — уйдёт позже */
export async function retryUndelivered(): Promise<void> {
    const pending = db
        .query(
            'SELECT id, name, contact, message, locale, ip, spam_flags FROM messages WHERE delivered = 0 AND delivery_attempts < 20 ORDER BY id LIMIT 10',
        )
        .all() as Array<{
        id: number
        name: string
        contact: string
        message: string
        locale: string
        ip: string
        spam_flags: string
    }>

    for (const m of pending) {
        const ok = await sendToTelegram({
            name: m.name,
            contact: m.contact,
            message: m.message,
            locale: m.locale,
            ip: m.ip,
            spamFlags: JSON.parse(m.spam_flags) as string[],
        })
        db.run(
            'UPDATE messages SET delivered = ?, delivery_attempts = delivery_attempts + 1 WHERE id = ?',
            [ok ? 1 : 0, m.id],
        )
        if (!ok) break // телеграм лежит — не молотим зря
    }
}
