import { config } from '../config'
import { getSetting, setSetting } from '../db'

const API = `https://api.telegram.org/bot${config.botToken}`

function escapeHtml(text: string): string {
    return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/**
 * chat_id берётся из env, из БД (если уже находили) или из getUpdates:
 * достаточно один раз написать боту /start, и сервер запомнит чат навсегда.
 */
export async function resolveChatId(): Promise<string | null> {
    if (config.chatId) return config.chatId

    const saved = getSetting('telegram_chat_id')
    if (saved) return saved

    if (!config.botToken) return null

    try {
        const res = await fetch(`${API}/getUpdates`, { signal: AbortSignal.timeout(10_000) })
        if (!res.ok) return null
        const data = (await res.json()) as {
            ok: boolean
            result: Array<{ message?: { chat?: { id: number; type: string } } }>
        }
        if (!data.ok) return null
        const privateChat = data.result
            .map((u) => u.message?.chat)
            .find((c) => c && c.type === 'private')
        if (!privateChat) return null
        const id = String(privateChat.id)
        setSetting('telegram_chat_id', id)
        console.log(`[telegram] нашёл chat_id ${id} через getUpdates и сохранил в БД`)
        return id
    } catch {
        return null
    }
}

export interface IncomingMessage {
    name: string
    contact: string
    message: string
    locale: string
    ip: string
    spamFlags: string[]
}

function formatMessage(m: IncomingMessage): string {
    const flags = m.spamFlags.length > 0 ? ` · flags: ${m.spamFlags.join(',')}` : ''
    return [
        '<b>📨 aaaver.ru — новое сообщение</b>',
        '',
        `<b>Имя:</b> ${escapeHtml(m.name)}`,
        `<b>Контакт:</b> ${escapeHtml(m.contact)}`,
        '',
        `<blockquote>${escapeHtml(m.message)}</blockquote>`,
        '',
        `<code>${escapeHtml(m.ip)} · ${escapeHtml(m.locale)}${escapeHtml(flags)}</code>`,
    ].join('\n')
}

export async function sendToTelegram(m: IncomingMessage): Promise<boolean> {
    if (!config.botToken) {
        console.warn('[telegram] TELEGRAM_BOT_TOKEN не задан — сообщение остаётся в БД')
        return false
    }
    const chatId = await resolveChatId()
    if (!chatId) {
        console.warn('[telegram] chat_id неизвестен. Напишите боту /start или задайте TELEGRAM_CHAT_ID')
        return false
    }

    try {
        const res = await fetch(`${API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: formatMessage(m),
                parse_mode: 'HTML',
            }),
            signal: AbortSignal.timeout(15_000),
        })
        if (!res.ok) {
            console.warn(`[telegram] sendMessage ответил ${res.status}: ${await res.text()}`)
            return false
        }
        return true
    } catch (err) {
        console.warn('[telegram] не дотянулся до API:', err)
        return false
    }
}
