/**
 * Автодеплой демок: опрашивает релизы GitHub/GitLab по sites.config.json,
 * скачивает архив с собранным сайтом и атомарно подменяет sites/<slug>/.
 *
 * Запуск: bun scripts/sites-updater.ts [--once]
 * В докере крутится отдельным сервисом (см. docker-compose.yml) — у него,
 * в отличие от основного сервера, каталог sites смонтирован на запись.
 *
 * Контракт с демками: CI демки публикует релиз с тегом `latest` и ассетом
 * `dist.tar.gz`, внутри которого index.html лежит в корне
 * (см. .github/workflows/site-release.yml).
 */
import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { RESERVED, SLUG_RE } from '../server/lib/static/sites'

const SITES_DIR = process.env.SITES_DIR ?? './sites'
const CONFIG_PATH = process.env.SITES_CONFIG ?? './sites.config.json'
const GITHUB_API = process.env.GITHUB_API ?? 'https://api.github.com'
const GITLAB_API = process.env.GITLAB_API ?? 'https://gitlab.com/api/v4'
const POLL_MS = clampMinutes(process.env.SITES_POLL_MINUTES, 10) * 60 * 1000

const DEFAULT_ASSET = 'dist.tar.gz'
const MAX_ASSET_BYTES = 200 * 1024 * 1024
const USER_AGENT = 'aaaver-sites-updater'

interface SiteSource {
    /** `github:owner/repo` или `gitlab:group/project` */
    repo: string
    /** имя ассета в релизе */
    asset?: string
    /** конкретный тег; без него — `latest`, а затем последний релиз */
    tag?: string
}

interface ReleaseAsset {
    /** демка переустанавливается, когда меняется эта строка */
    version: string
    tag: string
    url: string
    /** 0 — размер заранее неизвестен (gitlab) */
    size: number
    headers: Record<string, string>
}

function clampMinutes(value: string | undefined, fallback: number): number {
    const n = Number(value)
    return Number.isFinite(n) && n >= 1 ? n : fallback
}

function log(msg: string): void {
    console.log(`[updater] ${msg}`)
}

// ---------- источники релизов ----------

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown | null> {
    const res = await fetch(url, { headers })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} на ${url}`)
    return res.json()
}

async function githubAsset(repo: string, source: SiteSource): Promise<ReleaseAsset | null> {
    const headers: Record<string, string> = {
        'User-Agent': USER_AGENT,
        Accept: 'application/vnd.github+json',
    }
    const token = process.env.GITHUB_TOKEN
    if (token) headers.Authorization = `Bearer ${token}`

    // канонический workflow держит скользящий релиз `latest`;
    // нет такого тега — берём последний обычный релиз
    const attempts = source.tag
        ? [`releases/tags/${encodeURIComponent(source.tag)}`]
        : ['releases/tags/latest', 'releases/latest']

    let release: any = null
    for (const path of attempts) {
        release = await fetchJson(`${GITHUB_API}/repos/${repo}/${path}`, headers)
        if (release) break
    }
    if (!release) return null

    const name = source.asset ?? DEFAULT_ASSET
    const asset = (release.assets ?? []).find((a: any) => a.name === name)
    if (!asset) return null

    return {
        version: `${release.tag_name}@${asset.updated_at}`,
        tag: release.tag_name,
        // api-ссылка + octet-stream работает и для приватных реп,
        // в отличие от browser_download_url
        url: asset.url,
        size: asset.size ?? 0,
        headers: { ...headers, Accept: 'application/octet-stream' },
    }
}

async function gitlabAsset(repo: string, source: SiteSource): Promise<ReleaseAsset | null> {
    const headers: Record<string, string> = { 'User-Agent': USER_AGENT }
    const token = process.env.GITLAB_TOKEN
    if (token) headers['PRIVATE-TOKEN'] = token

    const project = encodeURIComponent(repo)
    const url = source.tag
        ? `${GITLAB_API}/projects/${project}/releases/${encodeURIComponent(source.tag)}`
        : `${GITLAB_API}/projects/${project}/releases/permalink/latest`
    const release: any = await fetchJson(url, headers)
    if (!release) return null

    const name = source.asset ?? DEFAULT_ASSET
    const link = (release.assets?.links ?? []).find((l: any) => l.name === name)
    if (!link) return null

    return {
        version: `${release.tag_name}@${release.released_at}`,
        tag: release.tag_name,
        url: link.url,
        size: 0,
        headers,
    }
}

// ---------- скачивание и распаковка ----------

/**
 * fetch с ручными редиректами: заголовок авторизации не должен утекать
 * на другой origin (github редиректит скачивание ассетов на S3).
 */
async function download(startUrl: string, headers: Record<string, string>): Promise<ArrayBuffer> {
    let url = startUrl
    for (let hop = 0; hop < 5; hop++) {
        const sameOrigin = new URL(url).origin === new URL(startUrl).origin
        const res = await fetch(url, {
            headers: sameOrigin ? headers : { 'User-Agent': USER_AGENT },
            redirect: 'manual',
        })
        if ([301, 302, 303, 307, 308].includes(res.status)) {
            const location = res.headers.get('location')
            if (!location) throw new Error(`редирект без Location на ${url}`)
            url = new URL(location, url).toString()
            continue
        }
        if (!res.ok) throw new Error(`скачивание: ${res.status} ${res.statusText}`)
        return res.arrayBuffer()
    }
    throw new Error('слишком много редиректов')
}

async function run(cmd: string[], cwd: string): Promise<string> {
    const proc = Bun.spawn(cmd, { cwd, stdout: 'pipe', stderr: 'pipe' })
    const [out, err, code] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
    ])
    if (code !== 0) throw new Error(`${cmd[0]} завершился с ${code}: ${(err || out).trim()}`)
    return out
}

/** Пути в архиве не должны вылезать из папки распаковки (zip-slip) */
function assertSafeArchive(listing: string): void {
    for (const raw of listing.split('\n')) {
        const entry = raw.trim()
        if (!entry) continue
        if (entry.startsWith('/') || /(^|[/\\])\.\.([/\\]|$)/.test(entry)) {
            throw new Error(`подозрительный путь в архиве: ${entry}`)
        }
    }
}

async function deploy(slug: string, asset: ReleaseAsset): Promise<void> {
    // tar получает пути относительно SITES_DIR: абсолютный путь с `C:`
    // GNU tar принимает за адрес удалённого хоста
    const tarName = `.upload-${slug}.tar.gz`
    const dirName = `.upload-${slug}`
    const tmpDir = join(SITES_DIR, dirName)
    const tmpTar = join(SITES_DIR, tarName)
    await rm(tmpDir, { recursive: true, force: true })
    await rm(tmpTar, { force: true })

    try {
        if (asset.size > MAX_ASSET_BYTES) throw new Error(`ассет слишком большой: ${asset.size} байт`)
        const buf = await download(asset.url, asset.headers)
        if (buf.byteLength > MAX_ASSET_BYTES) throw new Error(`ассет слишком большой: ${buf.byteLength} байт`)
        await Bun.write(tmpTar, buf)

        assertSafeArchive(await run(['tar', '-tzf', tarName], SITES_DIR))
        await mkdir(tmpDir, { recursive: true })
        await run(['tar', '-xzf', tarName, '-C', dirName], SITES_DIR)

        if (!(await Bun.file(join(tmpDir, 'index.html')).exists())) {
            throw new Error('в корне архива нет index.html — пакуйте как `tar -czf dist.tar.gz -C dist .`')
        }

        await Bun.write(
            join(tmpDir, '.release.json'),
            JSON.stringify({ version: asset.version, tag: asset.tag, deployedAt: new Date().toISOString() }, null, 2),
        )

        // старая версия живёт до последнего момента, подмена — одним rename
        await rm(join(SITES_DIR, slug), { recursive: true, force: true })
        await rename(tmpDir, join(SITES_DIR, slug))
    } finally {
        await rm(tmpTar, { force: true })
        await rm(tmpDir, { recursive: true, force: true })
    }
}

// ---------- цикл ----------

async function currentVersion(slug: string): Promise<string | null> {
    try {
        const marker = await Bun.file(join(SITES_DIR, slug, '.release.json')).json()
        return typeof marker?.version === 'string' ? marker.version : null
    } catch {
        return null
    }
}

function parseRepo(spec: string): { provider: 'github' | 'gitlab'; repo: string } | null {
    const match = spec.match(/^(github|gitlab):(.+)$/)
    if (!match) return null
    return { provider: match[1] as 'github' | 'gitlab', repo: match[2]! }
}

async function loadConfig(): Promise<Record<string, SiteSource>> {
    const file = Bun.file(CONFIG_PATH)
    if (!(await file.exists())) {
        log(`конфига ${CONFIG_PATH} нет — нечего обновлять`)
        return {}
    }
    const raw = (await file.json()) as Record<string, SiteSource>
    const valid: Record<string, SiteSource> = {}
    for (const [slug, source] of Object.entries(raw)) {
        if (!SLUG_RE.test(slug) || RESERVED.has(slug)) {
            log(`пропускаю "${slug}": слаг занят или не [a-z0-9-]`)
        } else if (typeof source?.repo !== 'string' || !parseRepo(source.repo)) {
            log(`пропускаю "${slug}": repo должен быть "github:owner/repo" или "gitlab:group/project"`)
        } else {
            valid[slug] = source
        }
    }
    return valid
}

async function checkSite(slug: string, source: SiteSource): Promise<void> {
    const { provider, repo } = parseRepo(source.repo)!
    const asset = await (provider === 'github' ? githubAsset : gitlabAsset)(repo, source)
    if (!asset) {
        log(`${slug}: у ${source.repo} нет релиза с ${source.asset ?? DEFAULT_ASSET}`)
        return
    }
    if (asset.version === (await currentVersion(slug))) {
        log(`${slug}: актуально (${asset.version})`)
        return
    }
    log(`${slug}: обновляю до ${asset.version}`)
    await deploy(slug, asset)
    log(`${slug}: готово, /${slug}/ обновлён`)
}

let busy = false
async function cycle(): Promise<void> {
    if (busy) return
    busy = true
    try {
        const config = await loadConfig()
        for (const [slug, source] of Object.entries(config)) {
            try {
                await checkSite(slug, source)
            } catch (err) {
                console.error(`[updater] ${slug}:`, err instanceof Error ? err.message : err)
            }
        }
    } finally {
        busy = false
    }
}

/** Обломки прерванных деплоев — только на старте, чтобы не мешать deploy-site.bat */
async function cleanupStaleUploads(): Promise<void> {
    try {
        for (const name of await readdir(SITES_DIR)) {
            if (name.startsWith('.upload-')) {
                await rm(join(SITES_DIR, name), { recursive: true, force: true })
            }
        }
    } catch {
        /* каталога ещё нет */
    }
}

await mkdir(SITES_DIR, { recursive: true })
await cleanupStaleUploads()

log(`каталог демок: ${SITES_DIR}, конфиг: ${CONFIG_PATH}`)
await cycle()

if (process.argv.includes('--once')) {
    process.exit(0)
}
log(`опрашиваю релизы каждые ${POLL_MS / 60000} мин`)
setInterval(() => void cycle(), POLL_MS)
