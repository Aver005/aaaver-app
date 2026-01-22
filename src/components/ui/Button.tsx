import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>
{
  variant?: 'primary' | 'ghost' | 'outline' | 'soft'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps)
{
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30',
    ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
    outline: 'border border-white/20 text-white hover:bg-white/5',
    soft: 'bg-white/10 text-white hover:bg-white/20'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
