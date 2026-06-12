import { join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = fileURLToPath(new URL('../../dist', import.meta.url))

const CACHE_RULES: Array<[RegExp, string]> = [
    [/^\/assets\//, 'public, max-age=31536000, immutable'], // у vite хэши в именах
    [/\.(png|jpe?g|webp|svg|ico|woff2?)$/, 'public, max-age=86400'],
]

function cacheControl(pathname: string): string {
    for (const [pattern, value] of CACHE_RULES) {
        if (pattern.test(pathname)) return value
    }
    return 'no-cache'
}

/** Раздаёт собранный фронтенд; всё неизвестное — SPA-фолбэк на index.html */
export async function serveStatic(req: Request): Promise<Response> {
    const url = new URL(req.url)
    let pathname = decodeURIComponent(url.pathname)
    if (pathname === '/') pathname = '/index.html'

    // не даём выйти за пределы dist
    const safePath = normalize(pathname).replace(/^([/\\]|\.\.)+/, '')
    const file = Bun.file(join(DIST, safePath))

    if (await file.exists()) {
        return new Response(file, {
            headers: { 'Cache-Control': cacheControl(pathname) },
        })
    }

    const index = Bun.file(join(DIST, 'index.html'))
    if (await index.exists()) {
        return new Response(index, { headers: { 'Cache-Control': 'no-cache' } })
    }

    return new Response('dist/ не собран — выполните `bun run build`', { status: 404 })
}
