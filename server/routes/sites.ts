import { timingSafeEqual } from 'node:crypto'
import { config } from '../config'
import { json } from '../lib/http'
import { listSites } from '../lib/static/sites'

/** GET /api/sites — слаги живых демок; фронт может подсвечивать их на карточках */
export async function handleSites(): Promise<Response> {
    return json({ sites: await listSites() })
}

function reloadTokenOk(req: Request): boolean {
    const presented = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
    const a = Buffer.from(presented)
    const b = Buffer.from(config.sitesReloadToken)
    return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * POST /api/sites-reload — форс-проверка релизов, не дожидаясь цикла опроса.
 * Сам сервер писать в sites/ не может (read-only) — проксирует запрос
 * во внутренний /reload апдейтера. Требует Authorization: Bearer <токен>.
 */
export async function handleSitesReload(req: Request): Promise<Response> {
    if (!config.sitesReloadToken) return json({ error: 'disabled' }, 404)
    if (!reloadTokenOk(req)) return json({ error: 'unauthorized' }, 401)

    try {
        const res = await fetch(`${config.sitesUpdaterUrl}/reload`, {
            method: 'POST',
            // полный цикл — это скачивания; даём запас, но не висим вечно
            signal: AbortSignal.timeout(5 * 60 * 1000),
        })
        return json(await res.json(), res.status)
    } catch {
        return json({ error: 'updater-unavailable' }, 502)
    }
}
