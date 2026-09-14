import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from '../../config'
import { cacheControl, looksLikeFile, safeJoin, tryFile } from './files'
import type { StaticHandler } from './types'

/**
 * Демки: папка `sites/<slug>/` с собранным dist чужого проекта
 * раздаётся как самостоятельное SPA на роуте `/<slug>/`.
 * Папки монтируются с хоста — обновление демки не требует пересборки.
 */

/**
 * Имена, занятые самим портфолио, — такой слаг демке не достанется.
 * `admin` здесь потому, что обработчик демок пробуется ПЕРВЫМ: без брони
 * папка `sites/admin/` перекрыла бы панель управления собой. `en` — английская
 * версия портфолио.
 */
export const RESERVED = new Set(['api', 'assets', 'projects', 'admin', 'en'])

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

    if (looksLikeFile(path)) return null

    // пререндеренная страница демки: /slug/en → /slug/en/, как у корня
    if (await Bun.file(safeJoin(root, `${rest}/index.html`)).exists()) {
        return new Response(null, {
            status: 308,
            headers: { Location: `/${slug}${rest}/${search}` },
        })
    }

    // Демка со своим 404.html — пререндеренный сайт: неизвестный путь честно
    // отвечает 404. Без него — SPA, у которого может быть клиентский роутинг,
    // и фолбэк на index.html.
    const notFound = await tryFile(join(root, '404.html'), 'no-cache')
    if (notFound) return new Response(notFound.body, { status: 404, headers: notFound.headers })
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

/** Метка, которую апдейтер кладёт внутрь развёрнутой демки */
interface ReleaseMarker {
    version?: unknown
    tag?: unknown
    deployedAt?: unknown
}

export interface SiteInfo {
    slug: string
    /** null — демку залили мимо апдейтера (руками), метки внутри нет */
    version: string | null
    tag: string | null
    deployedAt: string | null
    bytes: number
    files: number
}

async function dirStats(root: string): Promise<{ bytes: number; files: number }> {
    let bytes = 0
    let files = 0
    // Демка — это собранный фронтенд: десятки файлов, не десятки тысяч,
    // поэтому обход целиком дешевле, чем хранить размер отдельной меткой.
    for (const name of await readdir(root, { recursive: true })) {
        try {
            const info = await stat(join(root, name))
            if (!info.isFile()) continue
            files++
            bytes += info.size
        } catch {
            // файл исчез между readdir и stat — апдейтер как раз подменял папку
        }
    }
    return { bytes, files }
}

/** Что реально лежит на диске — для админки. Истина здесь именно диск. */
export async function describeSites(): Promise<SiteInfo[]> {
    const infos: SiteInfo[] = []

    for (const slug of await listSites()) {
        const root = join(config.sitesDir, slug)

        let marker: ReleaseMarker = {}
        try {
            marker = (await Bun.file(join(root, '.release.json')).json()) as ReleaseMarker
        } catch {
            // метки нет или она битая — демка залита руками, это законно
        }

        const { bytes, files } = await dirStats(root)
        infos.push({
            slug,
            version: typeof marker.version === 'string' ? marker.version : null,
            tag: typeof marker.tag === 'string' ? marker.tag : null,
            deployedAt: typeof marker.deployedAt === 'string' ? marker.deployedAt : null,
            bytes,
            files,
        })
    }

    return infos
}
