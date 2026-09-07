import type { Project } from '@/entities/project'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { ProjectActions } from './ProjectActions'
import { ProjectFigure } from './ProjectFigure'
import { ProjectMeta } from './ProjectMeta'

interface PlateProps {
    project: Project
    number: string
    liveSites: ReadonlySet<string>
    /** wide — изображение и текст рядом; half — половина пары, всё в столбик */
    layout: 'wide' | 'half'
    reversed?: boolean
}

/** Пластина проекта: изображение или схема + факты вместо прилагательных */
export function Plate({ project, number, liveSites, layout, reversed = false }: PlateProps) {
    const { t, lx } = useI18n()
    const wide = layout === 'wide'

    return (
        <article className={cn('grid grid-cols-1 gap-6', wide && 'lg:grid-cols-12 lg:items-start lg:gap-10')}>
            <ProjectFigure
                project={project}
                className={cn(wide && 'lg:col-span-7', wide && reversed && 'lg:order-2')}
            />

            <div className={cn('flex flex-col', wide && 'lg:col-span-5')}>
                <ProjectMeta project={project} number={number} live={liveSites.has(project.id)} />
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
                    {project.title}
                </h3>
                <p className="mt-3 max-w-[48ch] text-[15px] leading-7 text-paper-dim">{lx(project.summary)}</p>

                <dl className="mt-5 grid grid-cols-[5rem_1fr] gap-x-4 gap-y-1.5 font-mono text-xs text-paper-dim">
                    <dt className="uppercase tracking-[0.18em] text-paper-faint">{t.projects.role}</dt>
                    <dd>{lx(project.role)}</dd>
                    <dt className="uppercase tracking-[0.18em] text-paper-faint">{t.projects.stack}</dt>
                    <dd>{project.stack.join(' · ')}</dd>
                </dl>

                {project.facts.length > 0 && (
                    <dl className="mt-5 grid grid-cols-3 gap-4 border-t hairline pt-4">
                        {project.facts.map((fact) => (
                            <div key={fact.value + fact.label.en}>
                                <dd className="font-display text-lg font-semibold text-paper">{fact.value}</dd>
                                <dt className="mt-1 font-mono text-[11px] leading-snug text-paper-faint">{lx(fact.label)}</dt>
                            </div>
                        ))}
                    </dl>
                )}

                <ProjectActions project={project} liveSites={liveSites} className="mt-6" />
            </div>
        </article>
    )
}
