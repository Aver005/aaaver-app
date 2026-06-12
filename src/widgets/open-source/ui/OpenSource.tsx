import { ArrowUpRight } from 'lucide-react'
import { RepoCard } from '@/entities/repo'
import { Section, Reveal, ButtonLink } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'
import { useRepos } from '../model/useRepos'

export function OpenSource() {
    const { t } = useI18n()
    const repos = useRepos(6)

    return (
        <Section id="opensource" index="04" title={t.openSource.title} subtitle={t.openSource.subtitle}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo, i) => (
                    <Reveal key={repo.name} delay={(i % 3) * 0.08} className="h-full">
                        <RepoCard repo={repo} />
                    </Reveal>
                ))}
            </div>
            <Reveal delay={0.2}>
                <div className="mt-10 flex justify-center">
                    <ButtonLink
                        href={SITE.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="ghost"
                    >
                        {t.openSource.viewAll}
                        <ArrowUpRight size={14} />
                    </ButtonLink>
                </div>
            </Reveal>
        </Section>
    )
}
