import type { Project } from './types'

export interface ProjectLink {
    url: string
    /** repo — ссылка на git; site — живой сайт (внутренняя демка или внешний прод) */
    kind: 'site' | 'repo'
}

const REPO_HOSTS = /^https?:\/\/(www\.)?(github|gitlab)\.com\//

/**
 * Куда ведёт карточка проекта. Живая демка на /<slug>/ (id проекта
 * совпадает со слагом в sites/) важнее ссылки из данных; ссылка на git
 * распознаётся по хосту. Без ссылки вовсе — null, карточка не кликается.
 */
export function projectLink(project: Project, liveSites: ReadonlySet<string>): ProjectLink | null {
    if (liveSites.has(project.id)) return { url: `/${project.id}/`, kind: 'site' }
    if (!project.url) return null
    return { url: project.url, kind: REPO_HOSTS.test(project.url) ? 'repo' : 'site' }
}
