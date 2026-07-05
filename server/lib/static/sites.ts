import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from '../../config'
import { cacheControl, looksLikeFile, safeJoin, tryFile } from './files'
import type { StaticHandler } from './types'

/**
 * Демки: папка `sites/<slug>/` с собранным dist чужого проекта
 * раздаётся как самостоятельное SPA на роуте `/<slug>/`.
 * Папки монтируются с хоста — обновление демки не требует пересборки.
 */

/** Имена, занятые самим портфолио, — такой слаг демке не достанется */
export const RESERVED = new Set(['api', 'assets', 'projects'])

export const SLUG_RE = /^[a-z0-9-]+$/

/** Корень демки, если слаг валиден и в ней есть index.html */
async function siteRoot(slug: string): Promise<string | null> {
    if (!SLUG_RE.test(slug) || RESERVED.has(slug)) return null
    const root = join(config.sitesDir, slug)
    const mounted = await Bun.file(join(root, 'index.html')).exists()
    return mounted ? root : null
}

export const serveSite: StaticHandler = async ({ pathname, search }) => {
    const [, slug = '', rest = ''] = pathname.match(/^\/([^/]+)(\/.*)?$/) ?? []
    const root = await siteRoot(slug)
    if (!root) return null

    // /slug → /slug/, иначе относительные пути в html демки разъедутся
    if (!rest) {
        return new Response(null, {
            status: 308,
            headers: { Location: `/${slug}/${search}` },
        })
    }

    const path = rest.endsWith('/') ? `${rest}index.html` : rest

    // дотфайлы не отдаём: там служебное (.release.json от апдейтера и т.п.)
    if (path.includes('/.')) return null

    const file = await tryFile(safeJoin(root, path), cacheControl(path))
    if (file) return file

    // у демки может быть свой клиентский роутинг — фолбэк на её index.html
    if (looksLikeFile(path)) return null
    return tryFile(join(root, 'index.html'), 'no-cache')
}

/** Слаги смонтированных демок — для /api/sites */
export async function listSites(): Promise<string[]> {
    let names: string[] = []
    try {
        const entries = await readdir(config.sitesDir, { withFileTypes: true })
        names = entries.filter((e) => e.isDirectory()).map((e) => e.name)
    } catch {
        return [] // каталога нет — демок нет
    }

    const slugs: string[] = []
    for (const name of names) {
        if (await siteRoot(name)) slugs.push(name)
    }
    return slugs.sort()
}
