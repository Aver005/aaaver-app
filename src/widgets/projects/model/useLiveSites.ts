import { useEffect, useState } from 'react'
import { fetchSites } from '@/shared/api'

const EMPTY: ReadonlySet<string> = new Set()

/**
 * Слаги живых демок с /api/sites. Пока ответ едет или при ошибке —
 * пустое множество: карточки ведут по ссылкам из данных, как раньше.
 */
export function useLiveSites(): ReadonlySet<string> {
    const [sites, setSites] = useState(EMPTY)

    useEffect(() => {
        let cancelled = false
        fetchSites()
            .then((slugs) => {
                if (!cancelled && slugs.length > 0) setSites(new Set(slugs))
            })
            .catch(() => {
                /* остаёмся на ссылках из данных */
            })
        return () => {
            cancelled = true
        }
    }, [])

    return sites
}
