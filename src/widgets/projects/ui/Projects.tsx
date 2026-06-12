import { PROJECTS, ProjectCard } from '@/entities/project'
import { Section, Reveal } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

export function Projects() {
    const { t } = useI18n()

    return (
        <Section id="projects" index="03" title={t.projects.title} subtitle={t.projects.subtitle}>
            <div className="flex flex-col gap-20 sm:gap-28">
                {PROJECTS.map((project, i) => (
                    <Reveal key={project.id}>
                        <ProjectCard project={project} index={i} reversed={i % 2 === 1} />
                    </Reveal>
                ))}
            </div>
        </Section>
    )
}
