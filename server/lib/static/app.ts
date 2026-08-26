import { fileURLToPath } from 'node:url'
import { cacheControl, looksLikeFile, safeJoin, tryFile } from './files'
import type { StaticHandler } from './types'

const DIST = fileURLToPath(new URL('../../../dist', import.meta.url))

/**
 * Панель управления живёт в том же SPA, на роуте `/admin`, и приезжает тем же
 * `index.html`. Поисковикам она не нужна — а отдельного html, куда можно было
 * бы вписать мета-тег, у неё нет, поэтому запрет уезжает заголовком.
 */
function noindexIfAdmin(pathname: string, res: Response): Response {
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        res.headers.set('X-Robots-Tag', 'noindex')
    }
    return res
}

/** Собранный фронтенд портфолио; пути без расширения — SPA-фолбэк на index.html */
export const serveApp: StaticHandler = async ({ pathname }) => {
    const path = pathname === '/' ? '/index.html' : pathname

    const file = await tryFile(safeJoin(DIST, path), cacheControl(path))
    if (file) return file

    // файл с расширением не нашёлся — честный 404 вместо html вместо картинки
    if (looksLikeFile(path)) return null

    const index = await tryFile(safeJoin(DIST, 'index.html'), 'no-cache')
    if (index) return noindexIfAdmin(pathname, index)

    return new Response('dist/ не собран — выполните `bun run build`', { status: 404 })
}
