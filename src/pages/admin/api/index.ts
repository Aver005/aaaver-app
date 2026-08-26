/** Клиент админского API. Отдельно от `shared/api`: этим ходит только панель. */

export interface AdminUser {
    email: string
    name: string
}

export type SiteProvider = 'github' | 'gitlab'

/**
 * Реестр и диск — две разные истины, поэтому и состояний четыре, а не два:
 *
 *   live       в реестре, на диске, обновляется;
 *   disabled   на диске и раздаётся, но обновление выключено;
 *   pending    в реестре есть, на диске ещё нет — апдейтер не сходил;
 *   unmanaged  на диске есть, в реестре нет: залито руками или убрано из него.
 */
export type SiteStatus = 'live' | 'disabled' | 'pending' | 'unmanaged'

export interface AdminSite {
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

export interface SiteFormValues {
    slug: string
    title: string
    provider: SiteProvider
    repo: string
    asset: string
    tag: string
}

/**
 * Состояние входа. `disabled` — отдельно от `anonymous` намеренно: «вход не
 * настроен на сервере» и «вы не вошли» лечатся совершенно по-разному, и
 * кнопка «Войти» во втором случае просто уводила бы в тупик.
 */
export type AuthState =
    | { status: 'loading' }
    | { status: 'anonymous' }
    | { status: 'disabled' }
    | { status: 'error'; message: string }
    | { status: 'authorized'; user: AdminUser }

export async function fetchMe(): Promise<AuthState> {
    let res: Response
    try {
        res = await fetch('/api/admin/me')
    } catch {
        return { status: 'error', message: 'Сервер не отвечает' }
    }

    if (res.status === 401) return { status: 'anonymous' }
    if (res.status === 503) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        return body.error === 'sso-not-configured'
            ? { status: 'disabled' }
            : { status: 'error', message: 'База данных недоступна' }
    }
    if (!res.ok) return { status: 'error', message: `Неожиданный ответ ${res.status}` }

    const body = (await res.json()) as { user: AdminUser }
    return { status: 'authorized', user: body.user }
}

export async function fetchSites(): Promise<AdminSite[]> {
    const res = await fetch('/api/admin/sites')
    if (!res.ok) throw new Error(`sites ${res.status}`)
    const body = (await res.json()) as { sites: AdminSite[] }
    return body.sites
}

/**
 * Исход изменения: либо получилось, либо человеку есть что прочитать.
 *
 * Сервер объясняет отказ полем `detail` («слаг занят самим сайтом», «ожидается
 * owner/repo»), и терять это в пользу общего «ошибка» было бы обидно — именно
 * это сообщение и говорит, что исправить в форме.
 */
export type MutationResult = { ok: true } | { ok: false; detail: string }

async function mutate(url: string, method: string, body?: unknown): Promise<MutationResult> {
    let res: Response
    try {
        res = await fetch(url, {
            method,
            headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        })
    } catch {
        return { ok: false, detail: 'Сервер не отвечает' }
    }

    if (res.ok) return { ok: true }

    const payload = (await res.json().catch(() => ({}))) as { detail?: string; error?: string }
    return { ok: false, detail: payload.detail ?? payload.error ?? `Ошибка ${res.status}` }
}

export function createSite(values: SiteFormValues): Promise<MutationResult> {
    return mutate('/api/admin/sites', 'POST', values)
}

export function patchSite(
    slug: string,
    patch: Partial<Omit<SiteFormValues, 'slug'>> & { enabled?: boolean },
): Promise<MutationResult> {
    return mutate(`/api/admin/sites/${encodeURIComponent(slug)}`, 'PATCH', patch)
}

export function removeSite(slug: string): Promise<MutationResult> {
    return mutate(`/api/admin/sites/${encodeURIComponent(slug)}`, 'DELETE')
}

/** Попросить апдейтер сходить за релизами прямо сейчас, не дожидаясь цикла. */
export function reloadSites(): Promise<MutationResult> {
    return mutate('/api/admin/reload', 'POST')
}

export async function logout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST' })
}
