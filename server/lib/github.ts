export interface RepoInfo {
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
    archived: boolean
}

export interface GithubSource {
    user: string
    /** Необязательный токен: поднимает лимит с 60 до 5000 запросов в час */
    token?: string
}

/**
 * Что не попадает в ленту: сам сайт, README профиля, дот-репозитории
 * с утилитами и то, что автор не считает витриной. Имена в нижнем регистре.
 * Один список на сервер и на снимок для фолбэка (`scripts/repos-snapshot.ts`).
 */
const HIDDEN = new Set(['loodka-poopka', 'pooprusteek-test', 'worms-game', 'tg-screener', 'bun-utils', 'open-claude'])

export function selectRepos(repos: GithubRepo[], user: string, limit = 12): RepoInfo[] {
    const profile = user.toLowerCase()
    return repos
        .filter((r) => {
            const name = r.name.toLowerCase()
            return (
                !r.fork &&
                !r.archived &&
                name !== profile &&
                !name.startsWith('.') &&
                !name.startsWith('aaaver') &&
                !HIDDEN.has(name)
            )
        })
        .slice(0, limit)
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

/** Свежий список с GitHub; токен в логи не попадает — только в заголовок */
export async function fetchFromGithub({ user, token }: GithubSource): Promise<RepoInfo[]> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'aaaver-app',
    }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=100`, {
        headers,
        signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`github ${res.status}`)
    return selectRepos((await res.json()) as GithubRepo[], user)
}
