import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/cn'

interface OverlayDialogProps {
    labelledBy: string
    className?: string
    children: ReactNode
}

/**
 * Сам диалог внутри Overlay. Живёт только пока открыт: при монтировании
 * прячет приложение под `inert` (Tab не убегает под затемнение) и забирает
 * фокус, при размонтировании возвращает и то и другое.
 */
export function OverlayDialog({ labelledBy, className, children }: OverlayDialogProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const app = document.getElementById('root')
        const opener = document.activeElement
        if (app) app.inert = true
        ref.current?.focus()
        return () => {
            if (app) app.inert = false
            if (opener instanceof HTMLElement) opener.focus()
        }
    }, [])

    return (
        <motion.div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('relative flex flex-col outline-none', className)}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </motion.div>
    )
}
