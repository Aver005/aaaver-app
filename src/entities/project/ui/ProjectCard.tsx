import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { Tag } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { Project } from '../model/types'

interface ProjectCardProps {
    project: Project
    index: number
    reversed?: boolean
}

/**
 * Крупная редакционная карточка: скриншот в полупогашенных тонах,
 * который «оживает» при наведении, и гигантский номер на подложке.
 * Без url карточка не кликается (внутренние продукты без публичной ссылки).
 */
export function ProjectCard({ project, index, reversed = false }: ProjectCardProps) {
    const { t, lx } = useI18n()
    const number = String(index + 1).padStart(2, '0')

    const Root = (project.url ? 'a' : 'article') as 'a'
    const linkProps = project.url
        ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
        : {}

    return (
        <Root
            {...linkProps}
            className="group relative grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
        >
            <div
                className={cn(
                    'relative overflow-hidden border hairline lg:col-span-7',
                    reversed && 'lg:order-2',
                )}
            >
                <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover object-top saturate-[0.55] transition-all duration-700 ease-out group-hover:scale-[1.025] group-hover:saturate-100"
                />
                <div className="pointer-events-none absolute inset-0 bg-ember/15 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent transition-opacity duration-700 group-hover:opacity-0" />
            </div>

            <div className={cn('relative lg:col-span-5', reversed && 'lg:order-1')}>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-14 right-0 select-none font-display text-8xl font-bold text-outline opacity-35 sm:text-9xl lg:-top-20"
                >
                    {number}
                </span>

                <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-paper transition-colors duration-300 group-hover:text-ember sm:text-3xl">
                    {project.title}
                </h3>
                <p className="mt-4 max-w-md leading-relaxed text-paper-dim">{lx(project.description)}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </div>

                {project.url && (
                    <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 group-hover:text-ember">
                        {t.projects.visit}
                        <ArrowUpRight
                            size={14}
                            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                    </span>
                )}
            </div>
        </Root>
    )
}
