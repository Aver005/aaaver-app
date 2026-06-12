import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'solid' | 'ghost'

const base =
    'inline-flex items-center justify-center gap-2.5 px-6 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.22em] transition-colors duration-200 select-none cursor-pointer'

const variants: Record<Variant, string> = {
    solid: 'bg-ember text-ink hover:bg-ember-bright active:bg-ember-deep',
    ghost: 'border hairline text-paper hover:border-ember hover:text-ember',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    children: ReactNode
}

export function Button({ variant = 'solid', className, children, ...rest }: ButtonProps) {
    return (
        <button className={cn(base, variants[variant], className)} {...rest}>
            {children}
        </button>
    )
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: Variant
    children: ReactNode
}

export function ButtonLink({ variant = 'solid', className, children, ...rest }: ButtonLinkProps) {
    return (
        <a className={cn(base, variants[variant], className)} {...rest}>
            {children}
        </a>
    )
}
