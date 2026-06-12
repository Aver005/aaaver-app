import { config } from '../config'
import { getSetting, setSetting } from '../db'
import { json } from '../lib/http'

interface RepoInfo {
    name: string
    url: string
    description: string | null
    language: string | null
    stars: number
    topics: string[]
    pushedAt: string
}

interface GithubRepo {
    name: string
    html_url: string
    description: string | null
    language: string | null
    stargazers_count: number
    topics: string[]
    pushed_at: string
    fork: boolean
}

const CACHE_KEY = 'github_repos'

async function fetchFromGithub(): Promise<RepoInfo[]> {
    const res = await fetch(
        `https://api.github.com/users/${config.githubUser}/repos?sort=pushed&per_page=100`,
        {
            headers: {
                Accept: 'application/vnd.github+json',
                'User-Agent': 'aaaver-app',
            },
            signal: AbortSignal.timeout(10_000),
        },
    )
    if (!res.ok) throw new Error(`github ${res.status}`)
    const repos = (await res.json()) as GithubRepo[]

    return repos
        .filter(
            (r) =>
                !r.fork &&
                r.name !== config.githubUser && // README-репозиторий профиля
                !r.name.toLowerCase().startsWith('aaaver'), // сам этот сайт
        )
        .slice(0, 12)
        .map((r) => ({
            name: r.name,
            url: r.html_url,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            topics: r.topics ?? [],
            pushedAt: r.pushed_at,
        }))
}

/**
 * GET /api/github/repos — список репозиториев с кэшем в SQLite.
 * GitHub даёт всего 60 анонимных запросов в час, поэтому ответ
 * кэшируется на 6 часов, а при недоступности отдаётся протухший кэш.
 */
export async function handleGithubRepos(): Promise<Response> {
    const cached = getSetting(CACHE_KEY)
    if (cached) {
        const { fetchedAt, data } = JSON.parse(cached) as { fetchedAt: number; data: RepoInfo[] }
        if (Date.now() - fetchedAt < config.githubCacheTtlMs) return json(data)
    }

    try {
        const fresh = await fetchFromGithub()
        setSetting(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data: fresh }))
        return json(fresh)
    } catch {
        if (cached) {
            const { data } = JSON.parse(cached) as { data: RepoInfo[] }
            return json(data) // лучше протухшее, чем ничего
        }
        return json({ error: 'github-unavailable' }, 502)
    }
}
