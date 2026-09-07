import type { Project } from './types'

/** «2025 — наст. время», «2026», «2026 — 2027»: только годы, месяцы — шум */
export function periodLabel(period: Project['period'], present: string): string {
    const from = period.from.slice(0, 4)
    const to = period.to?.slice(0, 4)
    if (!to) return `${from} — ${present}`
    return to === from ? from : `${from} — ${to}`
}
