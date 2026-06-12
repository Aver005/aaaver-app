import type { ReactNode } from 'react'
import { motion } from 'motion/react'

interface RevealProps {
    children: ReactNode
    delay?: number
    y?: number
    className?: string
}

/** Появление при попадании во вьюпорт — один раз, мягкая кривая */
export function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    )
}
