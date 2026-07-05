import { json } from '../lib/http'
import { listSites } from '../lib/static/sites'

/** GET /api/sites — слаги живых демок; фронт может подсвечивать их на карточках */
export async function handleSites(): Promise<Response> {
    return json({ sites: await listSites() })
}
