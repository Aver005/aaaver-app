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
 * Просьба к апдейтеру проверить релизы прямо сейчас.
 *
 * Сам сервер писать в `sites/` не может — каталог смонтирован read-only, и
 * это главная граница проекта. Поэтому здесь ровно проксирование во
 * внутренний `/reload`, который наружу не опубликован.
 *
 * Отдельной функцией, потому что зовут её из двух мест с РАЗНОЙ проверкой
 * прав: снаружи по токену (для CI), из панели по сессии. Общее у них только
 * это тело запроса.
 */
export async function requestUpdaterReload(): Promise<Response> {
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

/**
 * POST /api/sites-reload — форс-проверка релизов, не дожидаясь цикла опроса.
 * Требует Authorization: Bearer <токен>; из панели то же самое делает
 * POST /api/admin/reload, но по сессии.
 */
export async function handleSitesReload(req: Request): Promise<Response> {
    if (!config.sitesReloadToken) return json({ error: 'disabled' }, 404)
    if (!reloadTokenOk(req)) return json({ error: 'unauthorized' }, 401)
    return requestUpdaterReload()
}
