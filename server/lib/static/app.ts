import { fileURLToPath } from 'node:url'
import { cacheControl, looksLikeFile, safeJoin, tryFile } from './files'
import type { StaticHandler } from './types'

const DIST = fileURLToPath(new URL('../../../dist', import.meta.url))

/**
 * Собранный фронтенд портфолио (см. scripts/prerender.ts).
 *
 * - `/` и `/en/` — пререндеренные `index.html` со всем текстом;
 * - `/en` и `/index.html` — постоянный редирект на каноничный адрес со слэшем;
 * - `/admin…` — пустая оболочка, React рисует панель сам;
 * - любой другой путь без расширения — та же оболочка, но со статусом 404:
 *   человек по битой ссылке всё равно видит портфолио, а поисковик не
 *   принимает мусорный адрес за копию главной.
 */
export const serveApp: StaticHandler = async ({ pathname, search }) => {
    if (pathname.endsWith('/index.html')) {
        return redirect(pathname.slice(0, -'index.html'.length) + search)
    }

    const path = pathname.endsWith('/') ? `${pathname}index.html` : pathname
    const file = await tryFile(safeJoin(DIST, path), cacheControl(path))
    if (file) return file

    // файл с расширением не нашёлся — честный 404 вместо html вместо картинки
    if (looksLikeFile(path)) return null

    if (await Bun.file(safeJoin(DIST, `${pathname}/index.html`)).exists()) {
        return redirect(`${pathname}/${search}`)
    }

    const shell = await tryFile(safeJoin(DIST, 'shell.html'), 'no-cache')
    if (!shell) return new Response('dist/ не собран — выполните `bun run build`', { status: 404 })

    // Панели нужна своя страница, но не в поиске; noindex лежит и в самой оболочке
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        shell.headers.set('X-Robots-Tag', 'noindex')
        return shell
    }

    return new Response(shell.body, { status: 404, headers: shell.headers })
}

function redirect(location: string): Response {
    return new Response(null, { status: 308, headers: { Location: location } })
}
