import { join, normalize } from 'node:path'

/** Правила кэширования; путь — относительно корня раздачи, не всего сайта */
const CACHE_RULES: Array<[RegExp, string]> = [
    [/^\/assets\//, 'public, max-age=31536000, immutable'], // у vite хэши в именах
    [/\.(png|jpe?g|webp|svg|ico|woff2?)$/, 'public, max-age=86400'],
]

export function cacheControl(pathname: string): string {
    for (const [pattern, value] of CACHE_RULES) {
        if (pattern.test(pathname)) return value
    }
    return 'no-cache'
}

/** Склеивает путь с корнем, не давая `..` и ведущим слэшам выйти за его пределы */
export function safeJoin(root: string, pathname: string): string {
    return join(root, normalize(pathname).replace(/^([/\\]|\.\.)+/, ''))
}

/** Последний сегмент с точкой — похоже на файл; таким не нужен SPA-фолбэк */
export function looksLikeFile(pathname: string): boolean {
    return pathname.slice(pathname.lastIndexOf('/') + 1).includes('.')
}

/** Отдаёт файл, если он существует, иначе null */
export async function tryFile(path: string, cache: string): Promise<Response | null> {
    const file = Bun.file(path)
    if (!(await file.exists())) return null
    return new Response(file, { headers: { 'Cache-Control': cache } })
}
