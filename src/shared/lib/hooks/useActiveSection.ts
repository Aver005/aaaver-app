import { useEffect, useState } from 'react'

/**
 * Id секции, которая сейчас в средней полосе вьюпорта. `ids` должен быть
 * стабильной ссылкой (константа модуля), иначе observer пересоздаётся.
 */
export function useActiveSection(ids: readonly string[]): string | null {
    const [active, setActive] = useState<string | null>(null)

    useEffect(() => {
        const elements = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null)
        if (elements.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActive(entry.target.id)
                }
            },
            { rootMargin: '-40% 0px -55% 0px' },
        )
        elements.forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [ids])

    return active
}
