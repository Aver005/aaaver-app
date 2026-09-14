/**
 * Пререндер портфолио: после `vite build` и `vite build --ssr` превращает
 * пустой `dist/index.html` в готовые страницы с текстом и head для каждого
 * языка, а заодно пишет sitemap.xml и llms.txt.
 *
 *   dist/index.html      русская версия, `/`
 *   dist/en/index.html   английская, `/en/`
 *   dist/shell.html      пустая оболочка с noindex: админка и 404
 *   dist/sitemap.xml     портфолио; демки сервер допишет сам
 *   dist/llms.txt        краткая карта сайта для ИИ-ассистентов
 *
 * Запускается из `bun run build`, руками не нужен.
 */
import { mkdir, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'

type Locale = 'ru' | 'en'

interface PageMeta {
    path: string
    title: string
    description: string
    ogLocale: string
}

interface Content {
    name: string
    kicker: string
    lede: string
    about: string
    jobs: { company: string; companyUrl?: string; role: string; from: string; to: string | null }[]
    projects: { id: string; title: string; url?: string; description: string }[]
    skills: string[]
}

interface ServerEntry {
    render(pathname: string): string
    content(locale: Locale): Content
    LOCALES: Locale[]
    ORIGIN: string
    PAGES: Record<Locale, PageMeta>
    SITE: { github: string; telegram: string; email: string }
}

const ROOT = join(import.meta.dir, '..')
const DIST = join(ROOT, 'dist')
const SSR = join(ROOT, 'dist-ssr')

const entry = (await import(join(SSR, 'entry-server.js'))) as ServerEntry
const { LOCALES, ORIGIN, PAGES, SITE } = entry

const template = await Bun.file(join(DIST, 'index.html')).text()
if (!template.includes('<div id="root"></div>')) {
    throw new Error('dist/index.html не похож на шаблон vite: нет пустого #root')
}

const today = new Date().toISOString().slice(0, 10)

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function jsonLd(locale: Locale): string {
    const page = PAGES[locale]
    const c = entry.content(locale)
    const other = entry.content(locale === 'ru' ? 'en' : 'ru')
    const current = c.jobs.find((job) => job.to === null)
    const url = ORIGIN + page.path

    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Person',
                '@id': `${ORIGIN}/#person`,
                name: c.name,
                alternateName: other.name,
                jobTitle: current?.role,
                worksFor: current && {
                    '@type': 'Organization',
                    name: current.company,
                    url: current.companyUrl,
                },
                description: c.lede,
                url: `${ORIGIN}/`,
                email: `mailto:${SITE.email}`,
                sameAs: [SITE.github, SITE.telegram],
                knowsAbout: c.skills,
            },
            {
                '@type': 'WebSite',
                '@id': `${ORIGIN}/#website`,
                url: `${ORIGIN}/`,
                name: 'aaaver.ru',
                inLanguage: LOCALES,
                publisher: { '@id': `${ORIGIN}/#person` },
            },
            {
                '@type': 'ProfilePage',
                '@id': `${url}#page`,
                url,
                name: page.title,
                description: page.description,
                inLanguage: locale,
                isPartOf: { '@id': `${ORIGIN}/#website` },
                mainEntity: { '@id': `${ORIGIN}/#person` },
            },
        ],
    }

    return JSON.stringify(graph).replace(/</g, '\\u003c')
}

function head(locale: Locale): string {
    const page = PAGES[locale]
    const url = ORIGIN + page.path
    const alternates = LOCALES.map(
        (l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${PAGES[l].path}" />`,
    )
    const ogAlternates = LOCALES.filter((l) => l !== locale).map(
        (l) => `<meta property="og:locale:alternate" content="${PAGES[l].ogLocale}" />`,
    )

    return [
        `<link rel="canonical" href="${url}" />`,
        ...alternates,
        `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${PAGES.ru.path}" />`,
        '<meta property="og:type" content="profile" />',
        '<meta property="og:site_name" content="aaaver.ru" />',
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
        `<meta property="og:image" content="${ORIGIN}/logo512.png" />`,
        `<meta property="og:locale" content="${page.ogLocale}" />`,
        ...ogAlternates,
        '<meta name="twitter:card" content="summary" />',
        `<script type="application/ld+json">${jsonLd(locale)}</script>`,
    ]
        .map((line) => `    ${line}`)
        .join('\n')
}

function page(locale: Locale): string {
    const meta = PAGES[locale]
    const markup = entry.render(meta.path)

    return template
        .replace(/<html lang="[^"]*">/, `<html lang="${locale}">`)
        .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
        .replace(
            /<meta name="description" content="[^"]*" \/>/,
            `<meta name="description" content="${escapeHtml(meta.description)}" />`,
        )
        .replace(/\s*<\/head>/, `\n${head(locale)}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root" data-route="${meta.path}">${markup}</div>`)
}

function sitemap(): string {
    const urls = LOCALES.map((locale) => {
        const links = LOCALES.map(
            (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}${PAGES[l].path}"/>`,
        )
        return [
            '  <url>',
            `    <loc>${ORIGIN}${PAGES[locale].path}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            ...links,
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${PAGES.ru.path}"/>`,
            '  </url>',
        ].join('\n')
    })

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...urls,
        '</urlset>',
        '',
    ].join('\n')
}

function llms(): string {
    const en = entry.content('en')
    const ru = entry.content('ru')
    const period = (job: Content['jobs'][number]) => `${job.from}–${job.to ?? 'present'}`

    return [
        `# ${en.name} (${ru.name})`,
        '',
        `> ${PAGES.en.description}`,
        '',
        en.about,
        '',
        '## Pages',
        '',
        `- [Portfolio in Russian](${ORIGIN}${PAGES.ru.path}): ${PAGES.ru.title}`,
        `- [Portfolio in English](${ORIGIN}${PAGES.en.path}): ${PAGES.en.title}`,
        '',
        '## Experience',
        '',
        ...en.jobs.map((job) => `- ${job.role}, ${job.company} (${period(job)})`),
        '',
        '## Projects',
        '',
        ...en.projects.map((p) => (p.url ? `- [${p.title}](${p.url}): ${p.description}` : `- ${p.title}: ${p.description}`)),
        '',
        '## Stack',
        '',
        en.skills.join(', '),
        '',
        '## Contacts',
        '',
        `- Email: ${SITE.email}`,
        `- GitHub: ${SITE.github}`,
        `- Telegram: ${SITE.telegram}`,
        '',
    ].join('\n')
}

async function write(relative: string, body: string) {
    const target = join(DIST, relative)
    await mkdir(dirname(target), { recursive: true })
    await Bun.write(target, body)
    console.log(`[prerender] ${relative} (${(body.length / 1024).toFixed(1)} KB)`)
}

await write(
    'shell.html',
    template.replace(/\s*<\/head>/, '\n    <meta name="robots" content="noindex" />\n  </head>'),
)
for (const locale of LOCALES) {
    await write(join(PAGES[locale].path.slice(1), 'index.html'), page(locale))
}
await write('sitemap.xml', sitemap())
await write('llms.txt', llms())

await rm(SSR, { recursive: true, force: true })
