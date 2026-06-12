import { useEffect, useState } from 'react'
import { fetchRepos, type RepoInfo } from '@/shared/api'
import { REPOS_FALLBACK } from '@/entities/repo'

/**
 * Живые репозитории с GitHub (через серверный кэш). Пока ответ едет —
 * показываем снимок времён сборки, при ошибке остаёмся на нём же.
 */
export function useRepos(limit = 6) {
    const [repos, setRepos] = useState<RepoInfo[]>(REPOS_FALLBACK)

    useEffect(() => {
        let cancelled = false
        fetchRepos()
            .then((live) => {
                if (!cancelled && live.length > 0) setRepos(live)
            })
            .catch(() => {
                /* остаёмся на снимке */
            })
        return () => {
            cancelled = true
        }
    }, [])

    return repos.slice(0, limit)
}
