import type { L10n } from '@/shared/i18n'

export type ProjectKind = 'product' | 'tool' | 'game'

/** Жив ли проект как код. «Живая демка» — факт рантайма (/api/sites), не данных. */
export type ProjectStatus = 'active' | 'paused' | 'archived'

export interface ProjectFact {
    /** Строка, а не число: «31+», «0», «f32» */
    value: string
    label: L10n
}

export interface Project {
    /** Совпадает со слагом демки в sites/, если она есть */
    id: string
    title: string
    kind: ProjectKind
    status: ProjectStatus
    /** 'YYYY' или 'YYYY-MM'; без `to` — по настоящее время */
    period: { from: string; to?: string }
    role: L10n
    summary: L10n
    stack: readonly string[]
    /** Только проверяемые по репозиторию или API числа */
    facts: readonly ProjectFact[]
    links: { site?: string; repo?: string }
    /** [0] — обложка; две и больше — галерея */
    images: readonly string[]
}

export type ShowcaseEntry =
    | { type: 'single'; project: Project }
    | { type: 'pair'; label: L10n; projects: readonly [Project, Project] }
