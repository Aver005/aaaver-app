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

                        const shellClassName = cn(
                            'relative',
                            i > 0 && (isSibling ? 'mt-16 sm:mt-20 lg:mt-24' : 'mt-20 sm:mt-24 lg:mt-28'),
                            !isSibling && (i % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8'),
                        )

                        const frameClassName = cn(
                            'relative overflow-hidden rounded-[1.9rem] border border-paper-faint/10 bg-linear-to-br from-paper/[0.045] via-transparent to-ember/[0.03] px-4 py-4 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-[2px] sm:px-6 sm:py-6 lg:px-8 lg:py-8',
                            isSibling && 'rounded-[2.15rem] px-4 py-5 sm:px-6 sm:py-6',
                        )

                        if (isSibling) {
                            return (
                                <Reveal
                                    key={`sibling-${index}`}
                                    delay={0.08 + i * 0.06}
                                    className={shellClassName}
                                >
                                    <div className={frameClassName}>
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute -right-16 top-10 h-32 w-32 rounded-full bg-ember/8 blur-3xl"
                                        />
                                        <div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-linear-to-r from-transparent via-paper-faint/20 to-transparent"
                                        />
                                        <SiblingCard pair={item} index={index} />
                                    </div>
                                </Reveal>
                            )
                        }

                        const project = item

                        return (
                            <Reveal key={project.id} delay={0.08 + i * 0.06} className={shellClassName}>
                                <div className={frameClassName}>
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -left-10 top-8 h-24 w-24 rounded-full bg-paper/3 blur-3xl"
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-10 bottom-8 h-28 w-28 rounded-full bg-ember/8 blur-3xl"
                                    />
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-linear-to-r from-transparent via-paper-faint/20 to-transparent"
                                    />
                                    <ProjectCard
                                        project={project}
                                        index={index}
                                        reversed={i % 2 === 1}
                                    />
                                </div>
                            </Reveal>
                        )
                    })}
                </div>
            </div>
        </Section>
    )
}
