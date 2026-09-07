import { ArrowUpRight } from 'lucide-react'
import { ALL_PROJECTS } from '@/entities/project'
import { useRepos } from '@/entities/repo'
import { Section, Reveal, ButtonLink } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'
import { sectionIndex } from '@/shared/config/sections'
import { RepoRow } from './RepoRow'

const LIMIT = 8

/** Репозиторий известного проекта — по ссылке из его данных, без учёта регистра */
function knownProject(repoUrl: string) {
    const url = repoUrl.toLowerCase()
    return ALL_PROJECTS.find((project) => project.links.repo?.toLowerCase() === url)
}

export function OpenSource() {
    const { t, lx } = useI18n()
    const { repos, live, snapshotDate } = useRepos()
    const subtitle = live ? t.openSource.subtitle : `${t.openSource.snapshot} ${snapshotDate}`

    return (
        <Section id="opensource" index={sectionIndex('opensource')} title={t.openSource.title} subtitle={subtitle}>
            <Reveal>
                <ul className="border-t hairline">
                    {repos.slice(0, LIMIT).map((repo) => {
                        const project = knownProject(repo.url)
                        return (
                            <RepoRow
                                key={repo.name}
                                repo={repo}
                                fallbackDescription={project ? lx(project.summary) : undefined}
                            />
                        )
                    })}
                </ul>
            </Reveal>
            <Reveal delay={0.1}>
                <div className="mt-8 flex justify-end">
                    <ButtonLink href={SITE.github} target="_blank" rel="noopener noreferrer" variant="ghost">
                        {t.openSource.viewAll}
                        <ArrowUpRight size={14} />
                    </ButtonLink>
                </div>
            </Reveal>
        </Section>
    )
}
