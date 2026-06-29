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
            className="group relative grid grid-cols-1 items-center gap-7 lg:grid-cols-12 lg:gap-10"
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-[1.65rem] border hairline bg-ink-soft/40 p-3 shadow-[0_18px_70px_rgba(0,0,0,0.34)] lg:col-span-7',
                    reversed && 'lg:order-2',
                )}
            >
                <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center justify-between">
                    <span className="rounded-full border border-paper-faint/20 bg-ink/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-paper-faint/80 backdrop-blur">
                        {number}
                    </span>
                    <span className="rounded-full border border-paper-faint/15 bg-ink/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-paper-faint/75 backdrop-blur">
                        {lx({ ru: 'избранный проект', en: 'featured build' })}
                    </span>
                </div>
                <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="aspect-16/10 w-full rounded-[1.2rem] object-cover object-top saturate-[0.68] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
                />
                <div className="pointer-events-none absolute inset-3 rounded-[1.2rem] bg-ember/12 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
                <div className="pointer-events-none absolute inset-3 rounded-[1.2rem] bg-linear-to-t from-ink/70 via-ink/18 to-transparent transition-opacity duration-700 group-hover:opacity-0" />
                <div className="pointer-events-none absolute inset-x-3 bottom-3 h-24 rounded-b-[1.2rem] bg-linear-to-t from-ink/45 to-transparent" />
            </div>

            <div className={cn('relative lg:col-span-5', reversed && 'lg:order-1')}>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-12 right-0 select-none font-display text-8xl font-bold text-outline opacity-25 sm:text-9xl lg:-top-18"
                >
                    {number}
                </span>

                <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-10 bg-paper-faint/30" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-paper-faint/70">
                        {lx({ ru: 'веб-продукт', en: 'web product' })}
                    </span>
                </div>

                <h3 className="max-w-[10ch] font-display text-2xl font-semibold uppercase tracking-[-0.03em] text-paper transition-colors duration-300 group-hover:text-ember sm:text-3xl lg:text-[2.15rem]">
                    {project.title}
                </h3>
                <p className="mt-4 max-w-[38ch] text-[15px] leading-7 text-paper-dim sm:text-base">
                    {lx(project.description)}
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                    {project.tags.map((tag) => (
                        <Tag key={tag} className="bg-paper/2 text-paper-dim/95">
                            {tag}
                        </Tag>
                    ))}
                </div>

                {project.url && (
                    <div className="mt-7 flex justify-end">
                        <span className="inline-flex items-center gap-2.5 text-right font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 group-hover:text-ember">
                            <span className="h-px w-8 bg-current/35 transition-all duration-300 group-hover:w-12" />
                            {t.projects.visit}
                            <ArrowUpRight
                                size={14}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </span>
                    </div>
                )}
            </div>
        </Root>
    )
}
