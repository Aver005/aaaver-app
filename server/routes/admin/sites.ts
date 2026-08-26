import {
    createSiteSource,
    deleteSiteSource,
    findSiteSource,
    listSiteSources,
    updateSiteSource,
    validateProvider,
    validateRepo,
    validateSlug,
    type SiteInput,
    type SitePatch,
    type SiteProvider,
    type SiteSource,
} from '../../db/sites'
import { isUniqueViolation } from '../../db'
import { json } from '../../lib/http'
import { describeSites, type SiteInfo } from '../../lib/static/sites'
import { requestUpdaterReload } from '../sites'

/**
 * Управление демками: реестр в базе плюс то, что реально лежит на диске.
 *
 * ДВЕ ИСТИНЫ, И ОБЕ ПОКАЗЫВАЮТСЯ. Реестр — это НАМЕРЕНИЕ («этот слаг берётся
 * оттуда-то»), диск — ФАКТ («вот что раздаётся прямо сейчас»). Они законно
 * расходятся: сайт добавили минуту назад и апдейтер ещё не сходил за ним;
 * демку залили руками мимо реестра; запись из реестра убрали, а файлы
 * остались. Схлопывать это в один список означало бы врать в каждом из трёх
 * случаев, поэтому расхождение — не ошибка, а отдельное состояние с именем.
 */

type SiteStatus = 'live' | 'disabled' | 'pending' | 'unmanaged'

interface AdminSiteView {
    slug: string
    title: string
    status: SiteStatus
    source: {
        provider: SiteProvider
        repo: string
        asset: string
        tag: string
        enabled: boolean
        updatedAt: string
    } | null
    deployed: {
        version: string | null
        tag: string | null
        deployedAt: string | null
        bytes: number
        files: number
    } | null
}

function statusOf(source: SiteSource | undefined, disk: SiteInfo | undefined): SiteStatus {
    if (!source) return 'unmanaged'
    if (!disk) return 'pending'
    return source.enabled ? 'live' : 'disabled'
}

function view(slug: string, source: SiteSource | undefined, disk: SiteInfo | undefined): AdminSiteView {
    return {
        slug,
        title: source?.title || slug,
        status: statusOf(source, disk),
        source: source
            ? {
                  provider: source.provider,
                  repo: source.repo,
                  asset: source.asset,
                  tag: source.tag,
                  enabled: source.enabled,
                  updatedAt: source.updatedAt.toISOString(),
              }
            : null,
        deployed: disk
            ? {
                  version: disk.version,
                  tag: disk.tag,
                  deployedAt: disk.deployedAt,
                  bytes: disk.bytes,
                  files: disk.files,
              }
            : null,
    }
}

/** GET /api/admin/sites */
export async function listSitesForAdmin(): Promise<Response> {
    const [sources, disks] = await Promise.all([listSiteSources(), describeSites()])

    const bySlug = new Map(sources.map((s) => [s.slug, s]))
    const onDisk = new Map(disks.map((d) => [d.slug, d]))

    // Объединение, а не пересечение: слаг из любого источника обязан попасть
    // в список — иначе «залито руками» и «ещё не выкачено» просто исчезли бы
    // с экрана, а это ровно те два случая, ради которых сюда и заходят.
    const slugs = [...new Set([...bySlug.keys(), ...onDisk.keys()])].sort()

    return json({ sites: slugs.map((slug) => view(slug, bySlug.get(slug), onDisk.get(slug))) })
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
    try {
        const body = await req.json()
        return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null
    } catch {
        return null
    }
}

/** Необязательная строка с потолком длины: пусто и «не передано» — одно и то же. */
function optionalText(value: unknown, max: number): string | null | 'invalid' {
    if (value === undefined) return null
    if (typeof value !== 'string' || value.length > max) return 'invalid'
    return value.trim()
}

/** POST /api/admin/sites */
export async function createSiteForAdmin(req: Request): Promise<Response> {
    const body = await readJson(req)
    if (!body) return json({ error: 'validation', detail: 'ожидался JSON-объект' }, 400)

    const slugError = validateSlug(body.slug)
    if (slugError) return json({ error: 'validation', detail: slugError }, 400)

    const providerError = validateProvider(body.provider)
    if (providerError) return json({ error: 'validation', detail: providerError }, 400)

    const repoError = validateRepo(body.repo)
    if (repoError) return json({ error: 'validation', detail: repoError }, 400)

    const title = optionalText(body.title, 80)
    const asset = optionalText(body.asset, 100)
    const tag = optionalText(body.tag, 100)
    if (title === 'invalid' || asset === 'invalid' || tag === 'invalid') {
        return json({ error: 'validation', detail: 'название, ассет или тег слишком длинные' }, 400)
    }

    const input: SiteInput = {
        slug: body.slug as string,
        title: title || (body.slug as string),
        provider: body.provider as SiteProvider,
        repo: body.repo as string,
        asset: asset ?? '',
        tag: tag ?? '',
    }

    try {
        const created = await createSiteSource(input)
        return json({ site: view(created.slug, created, undefined) }, 201)
    } catch (error) {
        // Занятый слаг — это 409, а не 500: пользователь узнаёт, что делать.
        if (isUniqueViolation(error)) {
            return json({ error: 'conflict', detail: `слаг «${input.slug}» уже в реестре` }, 409)
        }
        throw error
    }
}

/** PATCH /api/admin/sites/:slug */
export async function updateSiteForAdmin(req: Request, slug: string): Promise<Response> {
    const body = await readJson(req)
    if (!body) return json({ error: 'validation', detail: 'ожидался JSON-объект' }, 400)

    const patch: SitePatch = {}

    if (body.provider !== undefined) {
        const error = validateProvider(body.provider)
        if (error) return json({ error: 'validation', detail: error }, 400)
        patch.provider = body.provider as SiteProvider
    }
    if (body.repo !== undefined) {
        const error = validateRepo(body.repo)
        if (error) return json({ error: 'validation', detail: error }, 400)
        patch.repo = body.repo as string
    }
    for (const field of ['title', 'asset', 'tag'] as const) {
        if (body[field] === undefined) continue
        const value = optionalText(body[field], field === 'title' ? 80 : 100)
        if (value === 'invalid') return json({ error: 'validation', detail: `${field}: слишком длинно` }, 400)
        patch[field] = value ?? ''
    }
    if (body.enabled !== undefined) {
        if (typeof body.enabled !== 'boolean') {
            return json({ error: 'validation', detail: 'enabled: true или false' }, 400)
        }
        patch.enabled = body.enabled
    }

    if (Object.keys(patch).length === 0) {
        return json({ error: 'validation', detail: 'нечего менять' }, 400)
    }

    const updated = await updateSiteSource(slug, patch)
    if (!updated) return json({ error: 'not-found' }, 404)

    const disks = await describeSites()
    return json({ site: view(slug, updated, disks.find((d) => d.slug === slug)) })
}

/**
 * DELETE /api/admin/sites/:slug — только из реестра.
 *
 * Файлы остаются: писать в `sites/` этот процесс не может физически, и это
 * не досадное ограничение, а та самая граница. Демка перестаёт обновляться,
 * но продолжает открываться, и в списке появляется честной пометкой
 * «не в реестре».
 */
export async function deleteSiteForAdmin(slug: string): Promise<Response> {
    const existing = await findSiteSource(slug)
    if (!existing) return json({ error: 'not-found' }, 404)

    await deleteSiteSource(slug)

    const disks = await describeSites()
    const stillOnDisk = disks.some((d) => d.slug === slug)
    return json({ ok: true, stillOnDisk })
}

/** POST /api/admin/reload — попросить апдейтер сходить за релизами сейчас. */
export async function reloadSitesForAdmin(): Promise<Response> {
    return requestUpdaterReload()
}
