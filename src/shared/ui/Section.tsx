import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Reveal } from './Reveal'

interface SectionProps {
    id: string
    index: string
    title: string
    subtitle?: string
    children: ReactNode
    className?: string
}

/**
 * Редакционная секция: тонкая линейка сверху, моноширинный индекс
 * и крупный display-заголовок.
 */
export function Section({ id, index, title, subtitle, children, className }: SectionProps) {
    return (
        <section id={id} className={cn('relative mx-auto w-full max-w-7xl px-5 sm:px-8', className)}>
            <Reveal>
                <header className="border-t hairline pt-6 sm:pt-8">
                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                        <span className="font-mono text-xs tracking-[0.3em] text-ember">{index}</span>
                        <h2 className="font-display text-3xl font-semibold uppercase tracking-tight text-paper sm:text-5xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="ml-auto max-w-xs text-right text-sm text-paper-dim max-sm:ml-0 max-sm:text-left">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </header>
            </Reveal>
            <div className="pt-10 sm:pt-14">{children}</div>
        </section>
    )
}
