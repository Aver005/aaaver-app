import type { BunRequest } from 'bun'
import { requireDb } from '../../db'
import { json } from '../../lib/http'
import {
    createSiteForAdmin,
    deleteSiteForAdmin,
    listSitesForAdmin,
    reloadSitesForAdmin,
    updateSiteForAdmin,
} from './sites'
import { adminEnabled } from './sso'
import { destroySession, readSession, type AdminUser } from './session'

export { handleAdminLogin, handleAdminCallback, adminEnabled } from './sso'

/**
 * Ворота админки.
 *
 * Отвечают JSON, а не страницей: сюда ходит уже открытый интерфейс через
 * fetch, и ему нужен разбираемый ответ, а не разметка. Навигацией браузера
 * приходят только `/api/admin/login` и возврат из панели — у них свои
 * страницы (см. `notice.ts`).
 */
async function requireAdmin(req: Request): Promise<AdminUser | Response> {
    if (!adminEnabled()) return json({ error: 'sso-not-configured' }, 503)
    requireDb()

    const user = await readSession(req)
    if (!user) return json({ error: 'unauthorized' }, 401)
    return user
}

/**
 * Мутации проверяют ещё и `Origin`.
 *
 * Сессионная cookie стоит `SameSite=Lax`, поэтому кросс-сайтовый POST её и так
 * не принесёт — но проверка стоит три строки, а полагаться на одну-единственную
 * защиту там, где удаляют сайты, не хочется.
 */
function sameOrigin(req: Request): boolean {
    const origin = req.headers.get('origin')
    if (!origin) return true // не браузерная форма: fetch всегда шлёт Origin
    try {
        return new URL(origin).host === new URL(req.url).host
    } catch {
        return false
    }
}

/**
 * Обёртка: проверка прав в одном месте.
 *
 * Изменяющие запросы дополнительно пишут строку в журнал systemd — кто, что и
 * с каким исходом. Это ещё не аудит (тот будет таблицей), но вопрос «кто
 * убрал демку из реестра» возникает раньше, чем доходят руки до таблицы, а
 * строка в журнале стоит ноль.
 */
function guard<T extends string>(
    handler: (req: BunRequest<T>, user: AdminUser) => Promise<Response>,
    options: { mutation?: boolean } = {},
) {
    return async (req: BunRequest<T>): Promise<Response> => {
        if (options.mutation && !sameOrigin(req)) return json({ error: 'bad-origin' }, 403)

        const user = await requireAdmin(req)
        if (user instanceof Response) return user

        const res = await handler(req, user)
        if (options.mutation) {
            console.log(`[admin] ${user.email}: ${req.method} ${new URL(req.url).pathname} → ${res.status}`)
        }
        return res
    }
}

/** GET /api/admin/me — кто вошёл; заодно так интерфейс узнаёт, что вход есть. */
export const handleAdminMe = guard(async (_req, user) =>
    json({ user: { email: user.email, name: user.name } }),
)

export const handleAdminSites = guard(() => listSitesForAdmin())
export const handleAdminSiteCreate = guard((req) => createSiteForAdmin(req), { mutation: true })
export const handleAdminSiteUpdate = guard<'/api/admin/sites/:slug'>(
    (req) => updateSiteForAdmin(req, req.params.slug),
    { mutation: true },
)
export const handleAdminSiteDelete = guard<'/api/admin/sites/:slug'>(
    (req) => deleteSiteForAdmin(req.params.slug),
    { mutation: true },
)

/**
 * POST /api/admin/reload — попросить апдейтер сходить за релизами сейчас.
 *
 * Отдельным путём, а не `/api/admin/sites/reload`: там уже живёт `:slug`, и
 * соседство статического сегмента с параметром — это ровно тот вид
 * неоднозначности, который потом отлаживают по частям.
 */
export const handleAdminReload = guard(() => reloadSitesForAdmin(), { mutation: true })

/** POST /api/admin/logout */
export async function handleAdminLogout(req: Request): Promise<Response> {
    if (!sameOrigin(req)) return json({ error: 'bad-origin' }, 403)
    requireDb()

    const cookie = await destroySession(req)
    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
    })
}
