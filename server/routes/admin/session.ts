import { config } from '../../config'
import { sql } from '../../db'
import { clearCookie, readCookie, setCookie } from '../../lib/cookie'

/**
 * Сессия админки: своя, короткая, в своей базе.
 *
 * Панель удостоверяет личность один раз и на одну минуту — дальше сессию
 * заводит клиент. Именно поэтому её не пытаются «продлить у панели»: токен там
 * нужен ровно на один переход из формы в браузере.
 */
const SESSION_COOKIE = 'admin_session'
const SESSION_PATH = '/'

export interface AdminUser {
    /** Неизменный идентификатор человека в панели */
    sub: string
    email: string
    name: string
}

function randomToken(bytes = 32): string {
    const buffer = new Uint8Array(bytes)
    crypto.getRandomValues(buffer)
    let binary = ''
    for (const byte of buffer) binary += String.fromCharCode(byte)
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

/**
 * В базу едет хеш, в cookie — сам токен.
 *
 * Разница существенная: у того, кто прочитал дамп базы, оказываются не ключи
 * от админки, а их отпечатки. Соли здесь не нужно — токен и так 256 случайных
 * бит, перебирать нечего.
 */
function hashToken(token: string): string {
    return new Bun.CryptoHasher('sha256').update(token).digest('hex')
}

/** Заводит сессию и возвращает готовый заголовок `Set-Cookie`. */
export async function createSession(
    user: AdminUser,
    meta: { ip: string; userAgent: string },
): Promise<string> {
    const token = randomToken()
    const ttlSec = Math.floor(config.adminSessionTtlMs / 1000)

    await sql`
        INSERT INTO admin_sessions (id, sub, email, name, ip, user_agent, expires_at)
        VALUES (
            ${hashToken(token)}, ${user.sub}, ${user.email}, ${user.name},
            ${meta.ip}, ${meta.userAgent.slice(0, 300)},
            now() + ${`${ttlSec} seconds`}::interval
        )
    `

    // Lax, а не None: обычная навигация cookie приносит, кросс-сайтовый POST —
    // нет. Для мутаций админки это бесплатная защита от CSRF.
    return setCookie(SESSION_COOKIE, token, {
        maxAgeSec: ttlSec,
        path: SESSION_PATH,
        sameSite: 'Lax',
    })
}

/**
 * Кто пришёл, или null.
 *
 * Срок сессии не продлевается при обращении: скользящее окно означало бы, что
 * открытая вкладка держит доступ вечно. Двенадцать часов — это рабочий день,
 * после него нужно войти заново.
 */
export async function readSession(req: Request): Promise<AdminUser | null> {
    const token = readCookie(req, SESSION_COOKIE)
    if (!token) return null

    const [row] = await sql`
        SELECT sub, email, name FROM admin_sessions
        WHERE id = ${hashToken(token)} AND expires_at > now()
    `
    if (!row) return null

    return { sub: row.sub as string, email: row.email as string, name: row.name as string }
}

/** Удаляет сессию из базы и возвращает `Set-Cookie`, гасящий её в браузере. */
export async function destroySession(req: Request): Promise<string> {
    const token = readCookie(req, SESSION_COOKIE)
    if (token) await sql`DELETE FROM admin_sessions WHERE id = ${hashToken(token)}`
    return clearCookie(SESSION_COOKIE, { path: SESSION_PATH, sameSite: 'Lax' })
}
