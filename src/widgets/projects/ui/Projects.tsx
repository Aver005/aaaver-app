import { SHOWCASE, TOOLS, numberShowcase, pad2, useLiveSites } from '@/entities/project'
import { useI18n } from '@/shared/i18n'
import { sectionIndex } from '@/shared/config/sections'
import { Section, Reveal } from '@/shared/ui'
import { Plate } from './Plate'
import { ToolRow } from './ToolRow'

export function Projects() {
    const { t, lx } = useI18n()
    const liveSites = useLiveSites()
    const entries = numberShowcase(SHOWCASE)

    return (
        <Section id="projects" index={sectionIndex('projects')} title={t.projects.title} subtitle={t.projects.subtitle}>
            <div className="flex flex-col gap-20 sm:gap-28">
                {entries.map(({ entry, from }, i) =>
                    entry.type === 'pair' ? (
                        <Reveal key={`pair-${from}`} delay={0.05}>
                            <div className="mb-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.24em] text-paper-faint">
                                <span className="text-ember">
                                    fig.{pad2(from)}–{pad2(from + 1)}
                                </span>
                                <span>{lx(entry.label)}</span>
                                <span className="h-px flex-1 bg-line" />
                            </div>
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
                                {entry.projects.map((project, j) => (
                                    <Plate
                                        key={project.id}
                                        project={project}
                                        number={pad2(from + j)}
                                        liveSites={liveSites}
                                        layout="half"
                                    />
                                ))}
                            </div>
                        </Reveal>
                    ) : (
                        <Reveal key={entry.project.id} delay={0.05}>
                            <Plate
                                project={entry.project}
                                number={pad2(from)}
                                liveSites={liveSites}
                                layout="wide"
                                reversed={i % 2 === 1}
                            />
                        </Reveal>
                    ),
                )}
            </div>

            <Reveal delay={0.05}>
                <div className="mt-24 sm:mt-32">
                    <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-ember">{t.projects.toolsTitle}</h3>
                    <ul className="mt-4 border-t hairline">
                        {TOOLS.map((project) => (
                            <ToolRow key={project.id} project={project} liveSites={liveSites} />
                        ))}
                    </ul>
                </div>
            </Reveal>
        </Section>
    )
}
