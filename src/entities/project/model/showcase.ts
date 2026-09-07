import type { Project, ShowcaseEntry } from './types'

export interface NumberedEntry {
    entry: ShowcaseEntry
    /** Порядковые номера с единицы: пара занимает два */
    from: number
    to: number
}

/** Нумерует витрину: пара «братьев» занимает два номера подряд */
export function numberShowcase(entries: readonly ShowcaseEntry[]): NumberedEntry[] {
    let next = 1
    return entries.map((entry) => {
        const from = next
        next += entry.type === 'pair' ? 2 : 1
        return { entry, from, to: next - 1 }
    })
}

export function showcaseProjects(entries: readonly ShowcaseEntry[]): Project[] {
    return entries.flatMap((entry) => (entry.type === 'pair' ? [...entry.projects] : [entry.project]))
}

/** «01», «07» — двузначный номер для подписей */
export function pad2(n: number): string {
    return String(n).padStart(2, '0')
}
