import type { Project } from './types'

/** Куда ведёт проект: демка внутри сайта, внешний сайт или репозиторий */
export type ProjectAction =
    | { kind: 'demo'; slug: string }
    | { kind: 'site'; url: string }
    | { kind: 'repo'; url: string }

/**
 * Живая демка на /<slug>/ важнее ссылок из данных, сайт важнее репозитория.
 * Без ссылок вовсе — null: карточка не кликается.
 */
export function projectAction(project: Project, liveSites: ReadonlySet<string>): ProjectAction | null {
    if (liveSites.has(project.id)) return { kind: 'demo', slug: project.id }
    if (project.links.site) return { kind: 'site', url: project.links.site }
    if (project.links.repo) return { kind: 'repo', url: project.links.repo }
    return null
}

/** Все действия проекта по порядку важности — для карточек с несколькими ссылками */
export function projectActions(project: Project, liveSites: ReadonlySet<string>): ProjectAction[] {
    const actions: ProjectAction[] = []
    if (liveSites.has(project.id)) actions.push({ kind: 'demo', slug: project.id })
    if (project.links.site) actions.push({ kind: 'site', url: project.links.site })
    if (project.links.repo) actions.push({ kind: 'repo', url: project.links.repo })
    return actions
}
