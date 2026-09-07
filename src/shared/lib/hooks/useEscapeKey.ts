import { useEffect } from 'react'

/** Вызывает `onEscape` по Escape, пока `active`. Одно место вместо копий в модалках. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
    useEffect(() => {
        if (!active) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onEscape()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [active, onEscape])
}
