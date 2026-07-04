import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { Section, Reveal } from '@/shared/ui'
import { PROJECTS, SIBLINGS, ProjectCard, SiblingCard, type SiblingPair } from '@/entities/project'

/** Индекс, с которого начинается SiblingPair в общем списке */
const SIBLING_INDEX = 1
type ProjectListItem = (typeof PROJECTS)[number] | SiblingPair

export function Projects() {
    const { t } = useI18n()

    const items: ProjectListItem[] = [
        ...PROJECTS.slice(0, SIBLING_INDEX),
        SIBLINGS,
        ...PROJECTS.slice(SIBLING_INDEX),
    ]

    let displayIndex = 0
    const entries = items.map((item) => {
        const index = displayIndex
        displayIndex += 'brothers' in item ? 2 : 1

        return { item, index }
    })

    return (
        <Section
            id="projects"
            index="03"
            title={t.projects.title}
            subtitle={t.projects.subtitle}
            className="overflow-hidden"
        >
            <div className="relative">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-6 hidden h-[calc(100%-3rem)] w-px bg-linear-to-b from-transparent via-paper-faint/12 to-transparent lg:block"
                />

                <div className="relative flex flex-col">
                    {entries.map(({ item, index }, i) => {
                        const isSibling = 'brothers' in item

                        // Каждый блок — самостоятельный редакционный юнит без внешней
                        // панели-обёртки: ритм задают только вертикальные отступы, а
                        // обычные карточки слегка смещаются в шахматном порядке.
                        const shellClassName = cn(
                            'relative',
                            i > 0 && (isSibling ? 'mt-20 sm:mt-24 lg:mt-28' : 'mt-24 sm:mt-28 lg:mt-32'),
                            !isSibling && (i % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'),
                        )

                        if (isSibling) {
                            return (
                                <Reveal
                                    key={`sibling-${index}`}
                                    delay={0.08 + i * 0.06}
                                    className={shellClassName}
                                >
                                    <SiblingCard pair={item} index={index} />
                                </Reveal>
                            )
                        }

                        const project = item

                        return (
                            <Reveal key={project.id} delay={0.08 + i * 0.06} className={shellClassName}>
                                <ProjectCard
                                    project={project}
                                    index={index}
                                    reversed={i % 2 === 1}
                                />
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </Section>
    )
}
