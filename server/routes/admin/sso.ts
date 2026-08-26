import { config } from '../../config'
import { isUniqueViolation, sql } from '../../db'
import { clearCookie, readCookie, setCookie } from '../../lib/cookie'
import { getClientIp, type BunServer } from '../../lib/http'
import { verifyHs256 } from '../../lib/jwt'
import { noticeResponse } from './notice'
import { createSession, type AdminUser } from './session'

/**
 * Вход в админку через панель root.kiviuly.ru.
 *
 * ═══ ПОЧЕМУ ЗДЕСЬ НЕТ ОБМЕНА КОДА НА ТОКЕН ═══
 *
 * Панель слушает `127.0.0.1` и unix-сокет на хосте, а мы живём в docker —
 * запрос «сервер к серверу» из контейнера до неё физически не доходит.
 * Поэтому поток implicit: панель сразу отдаёт подписанное утверждение, а мы
 * проверяем подпись общим секретом у себя, никуда не ходя.
 *
 * ═══ ГЛАВНАЯ ГРАБЛЯ ЭТОГО ОБМЕНА ═══
 *
 * Возврат приходит КРОСС-САЙТОВЫМ POST-ом: форма на странице панели
 * отправляется на наш адрес. Cookie с `SameSite=Lax` браузер в таком запросе
 * НЕ ПРИШЛЁТ, поэтому временная cookie со `state` обязана быть
 * `SameSite=None; Secure`. Сессионная при этом остаётся `Lax` — она нужна на
 * обычной навигации, и её кросс-сайтовая недоступность полезна.
 */
const STATE_COOKIE = 'admin_sso_state'
/** Узкий путь: эта cookie незачем возить на каждый запрос за картинкой. */
const STATE_PATH = '/api/admin'

/** Куда возвращаемся после удачного входа. */
const ADMIN_PAGE = '/admin'

/**
 * Админка включена, только когда настроена целиком.
 *
 * Пустой секрет или пустой список допущенных — это «ещё не настроили», и
 * открываться в таком виде вход не должен: список без записей означал бы либо
 * «пускать никого», либо, при небрежной проверке, «пускать всех».
 */
export function adminEnabled(): boolean {
    return config.ssoClientSecret.length > 0 && config.adminEmails.length > 0
}

function disabledNotice(): Response {
    return noticeResponse(503, {
        title: 'Админка не настроена',
        detail:
            'На сервере не заданы SSO_CLIENT_SECRET или ADMIN_EMAILS, поэтому вход через панель выключен.',
    })
}

/** GET /api/admin/login — уводит в панель за подтверждением личности. */
export function handleAdminLogin(): Response {
    if (!adminEnabled()) return disabledNotice()

    const state = crypto.randomUUID()

    const target = new URL('/api/sso/authorize', config.ssoIssuer)
    target.searchParams.set('client_id', config.ssoClientId)
    target.searchParams.set('redirect_uri', config.ssoRedirectUri)
    target.searchParams.set('state', state)

    return new Response(null, {
        status: 302,
        headers: {
            Location: target.toString(),
            'Cache-Control': 'no-store',
            'Set-Cookie': setCookie(STATE_COOKIE, state, {
                maxAgeSec: Math.floor(config.ssoStateTtlMs / 1000),
                path: STATE_PATH,
                sameSite: 'None',
            }),
        },
    })
}

function refuse(title: string, detail: string): Response {
    // `state` гасится на любом отказе: он одноразовый по смыслу, и оставлять
    // его жить означало бы разрешить вторую попытку с тем же значением.
    return noticeResponse(
        400,
        { title, detail, backTo: ADMIN_PAGE },
        { 'Set-Cookie': clearCookie(STATE_COOKIE, { path: STATE_PATH, sameSite: 'None' }) },
    )
}

/** Разбор утверждения панели: либо человек, либо причина отказа для журнала. */
async function readClaims(
    idToken: string,
    expectedState: string,
): Promise<{ ok: true; user: AdminUser; jti: string } | { ok: false; reason: string }> {
    const verdict = await verifyHs256(idToken, config.ssoClientSecret)
    if (!verdict.ok) return { ok: false, reason: verdict.reason }

    const claims = verdict.payload
    const str = (key: string): string => (typeof claims[key] === 'string' ? (claims[key] as string) : '')
    const num = (key: string): number => (typeof claims[key] === 'number' ? (claims[key] as number) : NaN)

    /**
     * `iss` сверяется обязательно: без этой проверки утверждение, подписанное
     * тем же секретом на другом стенде панели, прошло бы здесь как своё.
     */
    if (str('iss') !== config.ssoIssuer) return { ok: false, reason: 'wrong-issuer' }
    /** `aud` — что панель выдала это ИМЕННО НАМ, а не соседнему проекту. */
    if (str('aud') !== config.ssoClientId) return { ok: false, reason: 'wrong-audience' }

    /**
     * `state` сверяется с тем, что мы сами положили в cookie перед уходом.
     * Это защита от подсунутого чужого входа: без неё кто угодно мог бы
     * заставить браузер жертвы принять утверждение о СВОЕЙ личности.
     */
    if (!expectedState || str('state') !== expectedState) return { ok: false, reason: 'state-mismatch' }

    const nowSec = Math.floor(Date.now() / 1000)
    const exp = num('exp')
    const iat = num('iat')
    if (!Number.isFinite(exp) || nowSec >= exp + config.ssoClockSkewSec) {
        return { ok: false, reason: 'expired' }
    }
    if (!Number.isFinite(iat) || iat > nowSec + config.ssoClockSkewSec) {
        return { ok: false, reason: 'issued-in-future' }
    }

    const sub = str('sub')
    const email = str('email')
    const jti = str('jti')
    if (!sub || !email || !jti) return { ok: false, reason: 'incomplete-claims' }

    return { ok: true, user: { sub, email, name: str('name') || email }, jti }
}

/** POST /api/admin/sso/callback — возврат из панели формой с автоотправкой. */
export async function handleAdminCallback(req: Request, server: BunServer): Promise<Response> {
    if (!adminEnabled()) return disabledNotice()

    let idToken = ''
    let state = ''
    try {
        const form = await req.formData()
        idToken = String(form.get('id_token') ?? '')
        state = String(form.get('state') ?? '')
    } catch {
        return refuse('Непонятный ответ панели', 'Тело запроса не разобралось как форма.')
    }

    const expected = readCookie(req, STATE_COOKIE) ?? ''
    if (!expected) {
        return refuse(
            'Переход не сошёлся',
            'Метка перехода не найдена. Обычно это значит, что вход занял больше пяти минут ' +
                'или браузер не сохранил временную cookie. Попробуйте войти заново.',
        )
    }
    if (state !== expected) {
        return refuse('Переход не сошёлся', 'Метка перехода не совпала с выданной. Попробуйте войти заново.')
    }

    const parsed = await readClaims(idToken, expected)
    if (!parsed.ok) {
        console.warn(`[admin] вход отклонён: ${parsed.reason}`)
        return refuse(
            'Панель не подтвердила вход',
            'Утверждение о личности не прошло проверку. Если это повторяется, ' +
                'проверьте, что секрет клиента в панели и на сервере — один и тот же.',
        )
    }

    /**
     * Одноразовость: `jti` в первичном ключе превращает повторную отправку той
     * же формы (кнопка «обновить», повтор из журнала прокси) в нарушение
     * уникальности. Отдельного «уже использован?» перед вставкой нет
     * намеренно — проверка и запись в двух шагах оставляют щель между собой.
     */
    try {
        await sql`INSERT INTO sso_used_tokens (jti) VALUES (${parsed.jti})`
    } catch (error) {
        // Только нарушение уникальности означает повтор. Всё остальное —
        // например, отвалившийся Postgres — обязано лететь дальше: иначе
        // человек прочитает «вход уже использован» там, где на самом деле
        // лежит база, и будет чинить не то.
        if (!isUniqueViolation(error)) throw error
        return refuse(
            'Этот вход уже использован',
            'Утверждение панели одноразовое. Вернитесь на страницу входа и войдите заново.',
        )
    }

    if (!config.adminEmails.includes(parsed.user.email.toLowerCase())) {
        console.warn(`[admin] вход отклонён: ${parsed.user.email} нет в ADMIN_EMAILS`)
        return noticeResponse(
            403,
            {
                title: 'Доступ закрыт',
                detail: `Панель подтвердила, что вы ${parsed.user.email}, но этой почте здесь ничего не разрешено.`,
            },
            { 'Set-Cookie': clearCookie(STATE_COOKIE, { path: STATE_PATH, sameSite: 'None' }) },
        )
    }

    const sessionCookie = await createSession(parsed.user, {
        ip: getClientIp(req, server),
        userAgent: req.headers.get('user-agent') ?? '',
    })

    console.log(`[admin] вход: ${parsed.user.email}`)

    // 303, а не 302: после POST браузер обязан пойти на /admin именно GET-ом.
    const headers = new Headers({ Location: ADMIN_PAGE, 'Cache-Control': 'no-store' })
    headers.append('Set-Cookie', sessionCookie)
    headers.append('Set-Cookie', clearCookie(STATE_COOKIE, { path: STATE_PATH, sameSite: 'None' }))
    return new Response(null, { status: 303, headers })
}
