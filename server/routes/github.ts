import { config } from '../config'
import { getSetting, isConnectionError, setSetting } from '../db'
import { fetchFromGithub, type RepoInfo } from '../lib/github'
import { json } from '../lib/http'

const CACHE_KEY = 'github_repos'

/** Пауза между повторами после неудачи GitHub: не жечь лимит на каждом запросе */
const RETRY_AFTER_MS = 60_000

interface Cached {
    fetchedAt: number
    data: RepoInfo[]
}

/**
 * Копия последнего удачного ответа в памяти процесса: если база легла —
 * с самого старта или посреди дня, — а GitHub жив, лента не должна
 * проваливаться в снимок времён сборки.
 */
let memo: Cached | null = null
let failedAt = 0

function newest(a: Cached | null, b: Cached | null): Cached | null {
    if (!a) return b
    if (!b) return a
    return a.fetchedAt >= b.fetchedAt ? a : b
}

/** Кэш из базы и из памяти — что свежее; лежащая база — не ошибка, а отсутствие записи */
async function readCache(): Promise<Cached | null> {
    try {
        const raw = await getSetting(CACHE_KEY)
        return newest(raw ? (JSON.parse(raw) as Cached) : null, memo)
    } catch (error) {
        if (isConnectionError(error)) return memo
        throw error
    }
}

async function writeCache(entry: Cached): Promise<void> {
    memo = entry
    try {
        await setSetting(CACHE_KEY, JSON.stringify(entry))
    } catch (error) {
        // база лежит — переживём на памяти, следующий удачный ответ допишет
        if (!isConnectionError(error)) throw error
    }
}

/**
 * GET /api/github/repos — список репозиториев с кэшем.
 * Анонимный лимит GitHub — 60 запросов в час, поэтому ответ кэшируется на
 * 6 часов (в базе и в памяти), при недоступности отдаётся протухший кэш,
 * а после неудачи следующая попытка — не раньше чем через минуту.
 */
export async function handleGithubRepos(): Promise<Response> {
    const cached = await readCache()
    const fresh = cached !== null && Date.now() - cached.fetchedAt < config.githubCacheTtlMs
    const cooling = Date.now() - failedAt < RETRY_AFTER_MS
    if (fresh || (cooling && cached)) return json(cached.data)
    if (cooling) return json({ error: 'github-unavailable' }, 502)

    let data: RepoInfo[]
    try {
        data = await fetchFromGithub({ user: config.githubUser, token: config.githubToken })
    } catch {
        failedAt = Date.now()
        if (cached) return json(cached.data) // лучше протухшее, чем ничего
        return json({ error: 'github-unavailable' }, 502)
    }

    await writeCache({ fetchedAt: Date.now(), data })
    return json(data)
}
