import { useEffect } from 'react'

let locks = 0
let previousOverflow = ''

/**
 * Блокирует прокрутку страницы, пока `active`. Считает вложенные блокировки:
 * меню и модалка не затирают друг друга.
 */
export function useScrollLock(active: boolean): void {
    useEffect(() => {
        if (!active) return
        if (locks === 0) {
            previousOverflow = document.body.style.overflow
            document.body.style.overflow = 'hidden'
        }
        locks += 1
        return () => {
            locks -= 1
            if (locks === 0) document.body.style.overflow = previousOverflow
        }
    }, [active])
}
