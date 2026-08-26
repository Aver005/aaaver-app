/** Разбор `Cookie` и сборка `Set-Cookie` — ровно столько, сколько нужно админке. */

export function readCookie(req: Request, name: string): string | null {
    const header = req.headers.get('cookie')
    if (!header) return null

    for (const part of header.split(';')) {
        const eq = part.indexOf('=')
        if (eq === -1) continue
        if (part.slice(0, eq).trim() !== name) continue
        try {
            return decodeURIComponent(part.slice(eq + 1).trim())
        } catch {
            return null // битая процентная последовательность — считаем, что куки нет
        }
    }
    return null
}

export interface CookieOptions {
    maxAgeSec: number
    path: string
    /**
     * `Lax` — для сессии: обычная навигация её приносит, кросс-сайтовый POST
     * нет, и это бесплатная защита от CSRF.
     *
     * `None` — вынужденно для `state`. Возврат из панели приходит
     * КРОСС-САЙТОВЫМ POST-ом (форма с root.kiviuly.ru отправляется на
     * aaaver.ru), а при `Lax` браузер такую cookie НЕ ПРИШЛЁТ — и сверять
     * `state` будет не с чем. Это самая частая грабля в подобных обменах.
     */
    sameSite: 'Lax' | 'None'
}

/**
 * `Secure` стоит всегда и не настраивается.
 *
 * В проде сайт только по HTTPS, а `SameSite=None` без `Secure` браузер и не
 * примет. На `http://localhost` современные браузеры считают контекст
 * защищённым, поэтому дев тоже работает.
 */
export function setCookie(name: string, value: string, options: CookieOptions): string {
    return [
        `${name}=${encodeURIComponent(value)}`,
        `Path=${options.path}`,
        `Max-Age=${options.maxAgeSec}`,
        'HttpOnly',
        'Secure',
        `SameSite=${options.sameSite}`,
    ].join('; ')
}

/** Погашение: то же имя и путь, нулевой срок — иначе браузер cookie не забудет. */
export function clearCookie(name: string, options: Pick<CookieOptions, 'path' | 'sameSite'>): string {
    return setCookie(name, '', { maxAgeSec: 0, path: options.path, sameSite: options.sameSite })
}
