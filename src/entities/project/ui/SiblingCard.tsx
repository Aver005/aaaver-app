import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { Tag } from '@/shared/ui'
import type { SiblingPair } from '../model/types'

interface SiblingCardProps {
    pair: SiblingPair
    index: number
}

/**
 * Пара «братьев-проектов» в одном редакционном блоке. Каждый брат —
 * это один визуальный юнит без карточки-в-карточке: скруглённое
 * изображение с подписью-оверлеем снизу, а заголовок, описание и теги
 * идут ниже, отделённые только отступами и типографикой. Связка `&`
 * между двумя проектами — единственный декоративный акцент.
 */
export function SiblingCard({ pair, index }: SiblingCardProps) {
    const { t, lx } = useI18n()
    const number = `${String(index + 1).padStart(2, '0')}/${String(index + 2).padStart(2, '0')}`

    return (
        <article className="group/sibling">
            <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember">
                    {number}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-paper-faint/65">
                    {lx({
                        ru: 'братья-проекты',
                        en: 'sibling projects',
                    })}
                </span>
                <span className="hidden h-px min-w-16 flex-1 bg-paper-faint/14 sm:block" />
            </div>

            <div className="relative grid grid-cols-1 gap-x-10 gap-y-4 lg:grid-cols-2">
                {/* Связка «&» между братьями: тонкая вертикальная линия и медальон по центру (десктоп) */}
                <div className="pointer-events-none absolute inset-y-[12%] left-1/2 hidden lg:block">
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-transparent via-paper-faint/18 to-transparent" />
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/8 blur-2xl" />
                    <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border hairline bg-ink shadow-[0_0_30px_rgba(255,93,31,0.1)]">
                        <span className="font-mono text-xs text-ember">&</span>
                    </div>
                </div>

                {pair.brothers.map((project, i) => {
                    const isFirst = i === 0
                    const Root = (project.url ? 'a' : 'article') as 'a'
                    const linkProps = project.url
                        ? { href: project.url, target: '_blank', rel: 'noopener noreferrer' }
                        : {}
                    const brotherNumber = String(index + i + 1).padStart(2, '0')

                    return (
                        <div key={project.id} className="relative">
                            <Root {...linkProps} className="group/side flex h-full flex-col">
                                <div className="relative overflow-hidden rounded-[1.4rem] ring-1 ring-inset ring-line">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        loading="lazy"
                                        className="aspect-16/10 w-full object-cover object-top saturate-[0.72] transition-all duration-700 ease-out group-hover/side:scale-[1.03] group-hover/side:saturate-100"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-ember/12 mix-blend-multiply transition-opacity duration-700 group-hover/side:opacity-0" />
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/50 via-ink/6 to-transparent transition-opacity duration-700 group-hover/side:opacity-0" />
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink/70 to-transparent" />
                                    <div className="pointer-events-none absolute inset-x-5 bottom-4 z-10 flex items-baseline gap-3">
                                        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-ember">
                                            {isFirst ? 'alpha' : 'beta'}
                                        </span>
                                        <span className="h-px flex-1 bg-paper-faint/25" />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper-faint/80">
                                            {brotherNumber}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-1 flex-col">
                                    <div className="mb-3 flex items-center gap-3">
                                        <span className="h-px w-8 bg-paper-faint/24" />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-paper-faint/68">
                                            {lx({ ru: 'связанный релиз', en: 'linked release' })}
                                        </span>
                                    </div>

                                    <h3 className="font-display text-xl font-semibold uppercase tracking-[-0.03em] text-paper transition-colors duration-300 group-hover/side:text-ember sm:text-[1.7rem]">
                                        {project.title}
                                    </h3>
                                    <p className="mt-3 max-w-[34ch] flex-1 text-sm leading-7 text-paper-dim sm:text-[15px]">
                                        {lx(project.description)}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2.5">
                                        {project.tags.map((tag) => (
                                            <Tag key={tag} className="bg-paper/2 text-paper-dim/95">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>

                                    {project.url && (
                                        <div className="mt-5 flex justify-end">
                                            <span className="inline-flex items-center gap-2.5 text-right font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 group-hover/side:text-ember">
                                                <span className="h-px w-8 bg-current/35 transition-all duration-300 group-hover/side:w-12" />
                                                {t.projects.visit}
                                                <ArrowUpRight
                                                    size={14}
                                                    className="transition-transform duration-300 group-hover/side:-translate-y-0.5 group-hover/side:translate-x-0.5"
                                                />
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Root>

                            {isFirst && (
                                <div className="flex items-center justify-center py-4 lg:hidden">
                                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full border hairline bg-ink shadow-[0_0_30px_rgba(255,93,31,0.1)]">
                                        <div className="absolute h-14 w-14 rounded-full bg-ember/10 blur-2xl" />
                                        <span className="relative font-mono text-xs text-ember">&</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </article>
    )
}
