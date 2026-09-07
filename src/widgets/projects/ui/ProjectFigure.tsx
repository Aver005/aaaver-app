import { useState } from 'react'
import type { Project } from '@/entities/project'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { FIGURES } from './figures'

interface ProjectFigureProps {
    project: Project
    className?: string
}

/** Скриншот, галерея или схема — что есть у проекта */
export function ProjectFigure({ project, className }: ProjectFigureProps) {
    const { t } = useI18n()
    const [active, setActive] = useState(0)
    const images = project.images

    if (images.length === 0) {
        const Figure = FIGURES[project.id]
        return (
            <div className={cn('aspect-16/10', className)}>
                {Figure ? <Figure /> : <div className="h-full border hairline" />}
            </div>
        )
    }

    const current = images[active] ?? images[0]

    return (
        <div className={className}>
            <div className="overflow-hidden rounded-md border hairline bg-ink-raise">
                <img
                    key={current}
                    src={current}
                    alt={project.title}
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover object-top"
                />
            </div>
            {images.length > 1 && (
                <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                    {images.map((src, i) => (
                        <button
                            key={src}
                            type="button"
                            aria-pressed={i === active}
                            aria-label={`${t.projects.screenshot} ${i + 1} — ${project.title}`}
                            onClick={() => setActive(i)}
                            className={cn(
                                'cursor-pointer overflow-hidden rounded-sm border transition-opacity',
                                i === active ? 'border-ember/70 opacity-100' : 'hairline opacity-50 hover:opacity-90',
                            )}
                        >
                            <img src={src} alt="" aria-hidden="true" loading="lazy" className="aspect-16/10 w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
