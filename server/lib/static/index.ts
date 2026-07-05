import { serveApp } from './app'
import { serveSite } from './sites'
import type { StaticContext, StaticHandler } from './types'

/**
 * Конвейер статики: обработчики пробуются по порядку, первый Response
 * побеждает. Новая статичная фича = новый обработчик в этом списке.
 * Портфолио с его SPA-фолбэком — всегда последний.
 */
const handlers: StaticHandler[] = [serveSite, serveApp]

export async function serveStatic(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const ctx: StaticContext = {
        req,
        pathname: decodeURIComponent(url.pathname),
        search: url.search,
    }

    for (const handler of handlers) {
        const res = await handler(ctx)
        if (res) return res
    }

    return new Response('not found', { status: 404 })
}
