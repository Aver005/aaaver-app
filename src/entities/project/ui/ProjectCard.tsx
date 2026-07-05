import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { Tag } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { Project } from '../model/types'
import { projectLink } from '../model/link'

interface ProjectCardProps {
    project: Project
    index: number
    reversed?: boolean
    /** Слаги живых демок: для них карточка ведёт на /<slug>/ вместо ссылки из данных */
    liveSites?: ReadonlySet<string>
}

/**
 * Крупная редакционная карточка: скриншот в полупогашенных тонах,
 * который «оживает» при наведении, и гигантский номер на подложке.
 * Без url карточка не кликается (внутренние продукты без публичной ссылки).
 *
 * Изображение — единственная рамка визуального блока: оно занимает всю
 * область скруглённого контейнера без вложенного бордюр-в-бордюре бокса,
 * а индекс и подпись «избранный проект» собраны в одну строку-оверлей
 * снизу, а не в две плавающие пилюли по углам.
 *
 * Если у проекта есть `gallery` из двух и более изображений, карточка
 * переходит в режим медиа-галереи: корнем становится `<article>` (чтобы
 * интерактивные элементы — миниатюры и ссылка «visit» — не оказались
 * вложены в один общий `<a>`), под акцентным изображением появляется
 * ряд миниатюр для его переключения, а само изображение и ссылка «visit»
 * получают собственные `<a>`.
 */
export function ProjectCard({
    project,
    index,
    reversed = false,
    liveSites = new Set(),
}: ProjectCardProps) {
    const { t, lx } = useI18n()
    const number = String(index + 1).padStart(2, '0')
    const link = projectLink(project, liveSites)
    const visitLabel = link && (link.kind === 'repo' ? t.projects.visitRepo : t.projects.visitSite)

    const gallery = project.gallery && project.gallery.length >= 2 ? project.gallery : null
    const [activeIndex, setActiveIndex] = useState(0)
    const accentImage = gallery ? gallery[activeIndex] : project.image

    /** Затемняющие слои поверх скриншота: гасятся при наведении, кроме нижней подложки под подпись */
    const imageOverlays = (
        <>
            <div className="pointer-events-none absolute inset-0 bg-ember/10 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0" />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 via-ink/8 to-transparent transition-opacity duration-700 group-hover:opacity-0" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ink/70 to-transparent" />
        </>
    )

    /** Одна строка-подпись в углу изображения: индекс + микро-лейбл, вместо двух пилюль */
    const caption = (
        <div className="pointer-events-none absolute inset-x-5 bottom-4 z-10 flex items-baseline gap-3">
            <span className="font-mono text-xs tracking-[0.28em] text-ember">{number}</span>
            <span className="h-px flex-1 bg-paper-faint/25" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper-faint/80">
                {lx({ ru: 'избранный проект', en: 'featured build' })}
            </span>
        </div>
    )

    const textColumn = (
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

            {link && (
                <div className="mt-7 flex justify-end">
                    {gallery ? (
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 text-right font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 hover:text-ember"
                        >
                            <span className="h-px w-8 bg-current/35 transition-all duration-300 group-hover:w-12" />
                            {visitLabel}
                            <ArrowUpRight
                                size={14}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </a>
                    ) : (
                        <span className="inline-flex items-center gap-2.5 text-right font-mono text-xs uppercase tracking-[0.22em] text-paper-faint transition-colors duration-300 group-hover:text-ember">
                            <span className="h-px w-8 bg-current/35 transition-all duration-300 group-hover:w-12" />
                            {visitLabel}
                            <ArrowUpRight
                                size={14}
                                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </span>
                    )}
                </div>
            )}
        </div>
    )

    if (gallery) {
        const AccentRoot = (link ? 'a' : 'div') as 'div'
        const accentLinkProps = link
            ? { href: link.url, target: '_blank', rel: 'noopener noreferrer' }
            : {}

        return (
            <article className="group relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div className={cn('relative lg:col-span-7', reversed && 'lg:order-2')}>
                    <AccentRoot
                        {...accentLinkProps}
                        className="relative block overflow-hidden rounded-[1.4rem] ring-1 ring-inset ring-line"
                    >
                        <div className="relative aspect-16/10 w-full overflow-hidden">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.img
                                    key={accentImage}
                                    src={accentImage}
                                    alt={project.title}
                                    loading="lazy"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 h-full w-full object-cover object-top saturate-[0.68] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
                                />
                            </AnimatePresence>
                        </div>
                        {imageOverlays}
                        {caption}
                    </AccentRoot>

                    <div className="mt-3 grid grid-cols-4 gap-2.5 mb-1">
                        {gallery.map((src, i) => {
                            const active = i === activeIndex

                            return (
                                <button
                                    key={src}
                                    type="button"
                                    aria-pressed={active}
                                    aria-label={lx({
                                        ru: `Скриншот ${i + 1} — ${project.title}`,
                                        en: `Screenshot ${i + 1} — ${project.title}`,
                                    })}
                                    onClick={() => setActiveIndex(i)}
                                    className={cn(
                                        'cursor-pointer overflow-hidden rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/70',
                                        active
                                            ? 'opacity-100 ring-1 ring-ember/70'
                                            : 'opacity-45 saturate-[0.5] hover:opacity-80 hover:saturate-100',
                                    )}
                                >
                                    <img
                                        src={src}
                                        alt=""
                                        aria-hidden="true"
                                        loading="lazy"
                                        className="aspect-16/10 w-full object-cover"
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>

                {textColumn}
            </article>
        )
    }

    const Root = (link ? 'a' : 'article') as 'a'
    const linkProps = link
        ? { href: link.url, target: '_blank', rel: 'noopener noreferrer' }
        : {}

    return (
        <Root
            {...linkProps}
            className="group relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12"
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-[1.4rem] ring-1 ring-inset ring-line lg:col-span-7',
                    reversed && 'lg:order-2',
                )}
            >
                <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="aspect-16/10 w-full object-cover object-top saturate-[0.68] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:saturate-100"
                />
                {imageOverlays}
                {caption}
            </div>

            {textColumn}
        </Root>
    )
}
