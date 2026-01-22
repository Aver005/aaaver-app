import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

export function GlassCard({ className, hoverEffect = false, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300',
        hoverEffect && 'hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
