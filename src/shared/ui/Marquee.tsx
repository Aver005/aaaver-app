import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface MarqueeProps {
    children: ReactNode
    className?: string
}

/** Бесконечная бегущая строка. Контент дублируется для бесшовного цикла. */
export function Marquee({ children, className }: MarqueeProps) {
    return (
        <div className={cn('group overflow-hidden', className)}>
            <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                <div className="flex shrink-0 items-center">{children}</div>
                <div className="flex shrink-0 items-center" aria-hidden="true">
                    {children}
                </div>
            </div>
        </div>
    )
}
