import { RESERVED, SLUG_RE } from '../lib/static/sites'
import { sql } from './client'

/**
 * Реестр демок: что и откуда апдейтер обязан выкачивать.
 *
 * Читают его двое — панель (через админское API) и сам апдейтер, отдельным
 * процессом. Писать может только панель: у апдейтера роль ровно обратная —
 * он единственный, кто пишет на диск, и единственный, кто реестр только
 * читает. Направления не пересекаются, поэтому блокировок здесь не нужно.
 */

export type SiteProvider = 'github' | 'gitlab'

export interface SiteSource {
    slug: string
    title: string
    provider: SiteProvider
    repo: string
    /** '' = `dist.tar.gz` */
    asset: string
    /** '' = скользящий `latest` */
    tag: string
    enabled: boolean
    createdAt: Date
    updatedAt: Date
}

export interface SiteInput {
    slug: string
    title: string
    provider: SiteProvider
    repo: string
    asset: string
    tag: string
}

export type SitePatch = Partial<Omit<SiteInput, 'slug'>> & { enabled?: boolean }

function toSite(row: Record<string, unknown>): SiteSource {
    return {
        slug: row.slug as string,
        title: row.title as string,
        provider: row.provider as SiteProvider,
        repo: row.repo as string,
        asset: row.asset as string,
        tag: row.tag as string,
        enabled: row.enabled as boolean,
        createdAt: row.created_at as Date,
        updatedAt: row.updated_at as Date,
    }
}

const COLUMNS = 'slug, title, provider, repo, asset, tag, enabled, created_at, updated_at'

export async function listSiteSources(): Promise<SiteSource[]> {
    const rows = await sql`SELECT ${sql.unsafe(COLUMNS)} FROM sites ORDER BY slug`
    return rows.map(toSite)
}

/** Только то, что апдейтеру положено обновлять. */
export async function listEnabledSources(): Promise<SiteSource[]> {
    const rows = await sql`SELECT ${sql.unsafe(COLUMNS)} FROM sites WHERE enabled ORDER BY slug`
    return rows.map(toSite)
}

export async function createSiteSource(input: SiteInput): Promise<SiteSource> {
    const [row] = await sql`
        INSERT INTO sites (slug, title, provider, repo, asset, tag)
        VALUES (${input.slug}, ${input.title}, ${input.provider}, ${input.repo}, ${input.asset}, ${input.tag})
        RETURNING ${sql.unsafe(COLUMNS)}
    `
    return toSite(row!)
}

/**
 * Правка. `slug` не меняется: он же имя папки на диске и кусок публичного
 * адреса. Переименование — это переезд файлов и битые внешние ссылки, то есть
 * отдельная операция, а не поле в форме.
 */
export async function updateSiteSource(slug: string, patch: SitePatch): Promise<SiteSource | null> {
    const [row] = await sql`
        UPDATE sites SET
            title    = coalesce(${patch.title ?? null}, title),
            provider = coalesce(${patch.provider ?? null}, provider),
            repo     = coalesce(${patch.repo ?? null}, repo),
            asset    = coalesce(${patch.asset ?? null}, asset),
            tag      = coalesce(${patch.tag ?? null}, tag),
            enabled  = coalesce(${patch.enabled ?? null}, enabled),
            updated_at = now()
        WHERE slug = ${slug}
        RETURNING ${sql.unsafe(COLUMNS)}
    `
    return row ? toSite(row) : null
}

/**
 * Убирает запись из реестра. Файлы демки при этом ОСТАЮТСЯ на диске и
 * продолжают раздаваться — их удаляет апдейтер, единственный, кому туда
 * можно писать. Панель показывает такое состояние отдельной пометкой, а не
 * делает вид, что сайта больше нет.
 */
export async function deleteSiteSource(slug: string): Promise<boolean> {
    const result = await sql`DELETE FROM sites WHERE slug = ${slug}`
    return result.count > 0
}

export async function findSiteSource(slug: string): Promise<SiteSource | null> {
    const [row] = await sql`SELECT ${sql.unsafe(COLUMNS)} FROM sites WHERE slug = ${slug}`
    return row ? toSite(row) : null
}

// ---------- проверки ввода ----------

/**
 * Правила слага живут в обработчике статики и берутся оттуда, а не пишутся
 * здесь заново: это ЕГО правила — что он согласен раздать и какие имена уже
 * заняты портфолио. Вторая копия неизбежно разъехалась бы с первой.
 */
export function validateSlug(slug: unknown): string | null {
    if (typeof slug !== 'string' || !slug) return 'слаг обязателен'
    if (slug.length > 40) return 'слаг длиннее 40 символов'
    if (!SLUG_RE.test(slug)) return 'в слаге можно только строчные латинские буквы, цифры и дефис'
    if (RESERVED.has(slug)) return `слаг «${slug}» занят самим сайтом`
    return null
}

/** `owner/repo` — ровно два непустых куска, без схемы и без лишних слэшей. */
export function validateRepo(repo: unknown): string | null {
    if (typeof repo !== 'string' || !repo) return 'репозиторий обязателен'
    if (repo.length > 200) return 'слишком длинный путь репозитория'
    if (!/^[\w.-]+(?:\/[\w.-]+)+$/.test(repo)) {
        return 'ожидается «owner/repo» — без https:// и без префикса провайдера'
    }
    return null
}

export function validateProvider(provider: unknown): string | null {
    return provider === 'github' || provider === 'gitlab' ? null : 'провайдер: github или gitlab'
}
