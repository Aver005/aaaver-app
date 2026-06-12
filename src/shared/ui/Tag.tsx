import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                'inline-block border hairline px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim',
                className,
            )}
        >
            {children}
        </span>
    )
}
