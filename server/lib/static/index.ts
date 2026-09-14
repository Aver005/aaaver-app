import { serveApp } from './app'
import { serveSite } from './sites'
import { serveSitemap } from './sitemap'
import type { StaticContext, StaticHandler } from './types'

/**
 * Конвейер статики: обработчики пробуются по порядку, первый Response
 * побеждает. Новая статичная фича = новый обработчик в этом списке.
 * Портфолио с его SPA-фолбэком — всегда последний.
 */
const handlers: StaticHandler[] = [serveSitemap, serveSite, serveApp]

/**
 * Декодирование пути запроса.
 *
 * Отдельно и с проверками, потому что в `url.pathname` снаружи приезжает что
 * угодно. Сканеры регулярно бьют путями с NUL-байтом (`/etc/passwd%00.jpg`) —
 * на таком пути падает уже `Bun.file` — и битыми процентными
 * последовательностями (`/%ZZ`), на которых падает сам `decodeURIComponent`.
 * До этой проверки и то и другое уезжало в 500 со стектрейсом в журнале
 * вместо честного 404.
 */
function decodePath(pathname: string): string | null {
    let decoded: string
    try {
        decoded = decodeURIComponent(pathname)
    } catch {
        return null
    }
    return decoded.includes('\0') ? null : decoded
}

export async function serveStatic(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const pathname = decodePath(url.pathname)
    if (pathname === null) return new Response('not found', { status: 404 })

    const ctx: StaticContext = {
        req,
        pathname,
        search: url.search,
    }

    for (const handler of handlers) {
        const res = await handler(ctx)
        if (res) return res
    }

    return new Response('not found', { status: 404 })
}
