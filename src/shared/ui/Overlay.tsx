import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useEscapeKey, useScrollLock } from '@/shared/lib/hooks'
import { OverlayDialog } from './OverlayDialog'

interface OverlayProps {
    open: boolean
    onClose: () => void
    /** id заголовка диалога — для aria-labelledby */
    labelledBy: string
    children: ReactNode
    /** классы самого диалога: размеры, фон, рамка */
    className?: string
}

/**
 * Единственная модальная оболочка сайта: портал в body, затемнение, Esc,
 * блокировка прокрутки, `inert` на приложении и возврат фокуса.
 * Внешний вид диалога задаёт вызывающий.
 */
export function Overlay({ open, onClose, labelledBy, children, className }: OverlayProps) {
    useScrollLock(open)
    useEscapeKey(open, onClose)

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-110 flex items-center justify-center bg-ink/85 p-3 backdrop-blur-sm sm:p-6"
                    onClick={onClose}
                >
                    <OverlayDialog labelledBy={labelledBy} className={className}>
                        {children}
                    </OverlayDialog>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    )
}
