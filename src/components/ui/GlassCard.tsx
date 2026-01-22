import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement>
{
  hoverEffect?: boolean
}

export function GlassCard({ className, hoverEffect = false, children, ...props }: GlassCardProps)
{
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all duration-300',
        hoverEffect && 'hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-white/20',
        className
      )}
      {...props}
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] pointer-events-none" />

      {/* Inner sheen effect */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

      {children}
    </div>
  )
}
