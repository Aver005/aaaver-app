import type { MouseEvent } from 'react'

/** Обычный левый клик без модификаторов — такой можно перехватить, не ломая «открыть в новой вкладке» */
export function isPlainClick(event: MouseEvent): boolean {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}
