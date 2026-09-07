import { useSyncExternalStore } from 'react'

export interface DemoTarget {
    slug: string
    title: string
}

interface HistoryMark {
    demo?: DemoTarget
}

/** Адрес демки внутри сайта — одно место для ссылки и iframe */
export function demoUrl(slug: string): string {
    return `/${slug}/`
}

/**
 * Модульный стор без провайдера: окно открывают и карточки проектов, и
 * любые другие виджеты (командная строка), а хост один — на странице.
 *
 * Открытие кладёт запись в историю, чтобы «назад» закрывал окно, а не
 * уводил с сайта. Роутер демки внутри iframe пишет в ту же историю — тогда
 * «назад» сначала листает демку, потом закрывает окно; так и задумано.
 * Если после закрытия крестиком в истории остались записи демки, наша
 * пометка переживёт их — это следствие того же решения.
 */
let current: DemoTarget | null = null
const listeners = new Set<() => void>()

function set(next: DemoTarget | null) {
    current = next
    listeners.forEach((listener) => listener())
}

function historyMark(): HistoryMark | null {
    const state: unknown = window.history.state
    return state && typeof state === 'object' ? (state as HistoryMark) : null
}

export const demoWindow = {
    open(target: DemoTarget) {
        const mark: HistoryMark = { demo: target }
        // Стоим на своей же старой записи (после «назад» → «вперёд») — не плодим вторую
        if (historyMark()?.demo) window.history.replaceState(mark, '')
        else if (!current) window.history.pushState(mark, '')
        set(target)
    },
    close() {
        if (!current) return
        set(null)
        if (historyMark()?.demo) window.history.back()
    },
    /** Слушатель popstate: «назад» закрывает окно; «вперёд» на старую запись его не открывает */
    onPopState() {
        if (current && !historyMark()?.demo) set(null)
    },
    subscribe(listener: () => void) {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    },
    get: () => current,
}

export function useDemoWindow(): DemoTarget | null {
    return useSyncExternalStore(demoWindow.subscribe, demoWindow.get, () => null)
}

/** Окно уместно только с курсором и на широком экране: иначе демка открывается вкладкой */
export function canOpenInWindow(): boolean {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 1024
}
