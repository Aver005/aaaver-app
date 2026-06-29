import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { Tag } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { SiblingPair } from '../model/types'

interface SiblingCardProps {
    pair: SiblingPair
    index: number
}

export function SiblingCard({ pair, index }: SiblingCardProps) {
    const { t, lx } = useI18n()
    const number = `${String(index + 1).padStart(2, '0')}/${String(index + 2).padStart(2, '0')}`

    return (
        <article className="group/sibling">
            <div className="relative">
                <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
                    <span className="inline-flex items-center rounded-full border border-paper-faint/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-ember">
                        {number}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-paper-faint/65">
                        {lx({
                            ru: 'братья-проекты',
                            en: 'sibling projects',
                        })}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-11 lg:gap-0">
                    {pair.brothers.map((project, i) => {
                        const isFirst = i === 0
                        const Root = (project.url ? 'a' : 'article') as 'a'
                        const linkProps = project.url
                            ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
                            : {}

                        return (
                            <div
                                key={project.id}
                                className={cn(
                                    'relative lg:col-span-5',
                                    isFirst ? 'lg:pr-0' : 'lg:pl-0',
                                )}
                            >
                                <Root
                                    {...linkProps}
                                    className="group/side block"
                                >
                                    <div className="relative overflow-hidden border hairline">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            loading="lazy"
                                            className="aspect-16/10-full object-cover object-top saturate-[0.55] transition-all duration-700 ease-out group-hover/side:scale-[1.025] group-hover/side:saturate-100"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-ember/15 mix-blend-multiply transition-opacity duration-700 group-hover/side:opacity-0" />
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-trom-ink/50 to-transparent transition-opacity duration-700 group-hover/side:opacity-0" />
                                    </div>

                                    <div className="mt-4 sm:mt-5">
                                        <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-paper transition-colors duration-300 group-hover/side:text-ember sm:text-2xl">
                                            {project.title}
                                        </h3>
                                        <p className="mt-3 max-w-[34ch] leading-relaxed text-paper-dim text-sm sm:text-[15px]">
                                            {lx(project.description)}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {project.tags.map((tag) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </div>

                                        {project.url && (
                                            <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 group-hover/side:text-ember">
                                                {t.projects.visit}
                                                <ArrowUpRight
                                                    size={14}
                                                    className="transition-transform duration-300 group-hover/side:-translate-y-0.5 group-hover/side:translate-x-0.5"
                                                />
                                            </span>
                                        )}
                                    </div>
                                </Root>
                            </div>
                        )
                    })}

                    <div className="relative hidden items-center justify-center lg:col-span-1 lg:flex">
                        <div className="absolute inset-y-[15%] w-px bg-paper-faint/20" />
                        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border hairline bg-ink">
                            <span className="font-mono text-xs text-ember">&</span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    )
}
