import { useEffect, useState } from 'react'
import { fetchRepos, type RepoInfo } from '@/shared/api'
import { REPOS_FALLBACK, REPOS_SNAPSHOT_DATE } from './fallback'

export interface ReposState {
    repos: RepoInfo[]
    /** false — показан снимок времён сборки, а не живой ответ GitHub */
    live: boolean
    snapshotDate: string
}

const SNAPSHOT: ReposState = { repos: REPOS_FALLBACK, live: false, snapshotDate: REPOS_SNAPSHOT_DATE }

/**
 * Один запрос на страницу: результат делят все подписчики (лента, hero,
 * статус-бар). Пока ответ едет или если он не пришёл — снимок.
 */
let cached: ReposState | null = null
let inflight: Promise<ReposState> | null = null

function loadRepos(): Promise<ReposState> {
    if (cached) return Promise.resolve(cached)
    inflight ??= fetchRepos()
        .then((live) => {
            cached = live.length > 0 ? { ...SNAPSHOT, repos: live, live: true } : SNAPSHOT
            return cached
        })
        .catch(() => {
            inflight = null
            return SNAPSHOT
        })
    return inflight
}

export function useRepos(): ReposState {
    const [state, setState] = useState<ReposState>(() => cached ?? SNAPSHOT)

    useEffect(() => {
        let cancelled = false
        void loadRepos().then((next) => {
            if (!cancelled) setState(next)
        })
        return () => {
            cancelled = true
        }
    }, [])

    return state
}
