import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../../config'
import { listSites } from './sites'
import type { StaticHandler } from './types'

const SITEMAP = fileURLToPath(new URL('../../../dist/sitemap.xml', import.meta.url))

/** Когда апдейтер выкатил демку; у залитой руками метки нет — и lastmod не будет */
async function deployedAt(slug: string): Promise<string | null> {
    try {
        const marker = (await Bun.file(join(config.sitesDir, slug, '.release.json')).json()) as {
            deployedAt?: unknown
        }
        return typeof marker.deployedAt === 'string' ? marker.deployedAt.slice(0, 10) : null
    } catch {
        return null
    }
}

/**
 * Демка, чья главная объявляет каноничным другой адрес (например, копия
 * лендинга с GitHub Pages), в sitemap не идёт: там место только каноничным URL.
 */
async function canonicalHere(slug: string, url: string): Promise<boolean> {
    try {
        const html = await Bun.file(join(config.sitesDir, slug, 'index.html')).text()
        const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]
        const href = tag?.match(/href=["']([^"']+)["']/i)?.[1]
        return !href || href === url
    } catch {
        return false
    }
}

/**
 * sitemap.xml = страницы портфолио из сборки + корни смонтированных демок.
 *
 * Демки появляются без пересборки, поэтому их список дописывается на лету.
 * Домен берётся из первого `<loc>` собранного файла, чтобы не заводить
 * для него отдельную переменную окружения.
 */
export const serveSitemap: StaticHandler = async ({ pathname }) => {
    if (pathname !== '/sitemap.xml') return null

    const file = Bun.file(SITEMAP)
    if (!(await file.exists())) return null
    const base = await file.text()

    const loc = base.match(/<loc>([^<]+)<\/loc>/)?.[1]
    if (!loc) return null
    const origin = new URL(loc).origin

    const entries: string[] = []
    for (const slug of await listSites()) {
        if (!(await canonicalHere(slug, `${origin}/${slug}/`))) continue
        const lastmod = await deployedAt(slug)
        entries.push(
            [
                '  <url>',
                `    <loc>${origin}/${slug}/</loc>`,
                ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
                '  </url>',
            ].join('\n'),
        )
    }

    const body = base.replace('</urlset>', [...entries, '</urlset>'].join('\n'))
    return new Response(body, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
}
