import { useRef } from 'react'
import { motion, useMotionValue, useSpring, type Variants } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { ButtonLink } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
}

const item: Variants = {
    hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.85, ease: [0.21, 0.47, 0.32, 0.98] },
    },
}

export function Hero() {
    const { t } = useI18n()
    const sectionRef = useRef<HTMLElement>(null)

    // янтарное свечение, лениво плывущее за курсором
    const rawX = useMotionValue(0)
    const rawY = useMotionValue(0)
    const glowX = useSpring(rawX, { stiffness: 50, damping: 20 })
    const glowY = useSpring(rawY, { stiffness: 50, damping: 20 })

    return (
        <section
            id="top"
            ref={sectionRef}
            onPointerMove={(e) => {
                const rect = sectionRef.current?.getBoundingClientRect()
                if (!rect) return
                rawX.set(e.clientX - rect.left)
                rawY.set(e.clientY - rect.top)
            }}
            className="relative flex min-h-svh flex-col justify-center overflow-hidden"
        >
            <div aria-hidden="true" className="cross-grid absolute inset-0" />
            <motion.div
                aria-hidden="true"
                style={{ x: glowX, y: glowY }}
                className="pointer-events-none absolute -top-[21rem] -left-[21rem] size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(255,93,31,0.13),transparent_62%)]"
            />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative mx-auto w-full max-w-7xl px-5 pt-24 pb-32 sm:px-8"
            >
                <motion.p
                    variants={item}
                    className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-ember sm:text-sm"
                >
                    <span className="text-paper-faint">{'// '}</span>
                    {t.hero.kicker}
                </motion.p>

                <motion.h1
                    variants={item}
                    className="font-display text-[clamp(2.6rem,9.5vw,8rem)] leading-[1.06] font-bold uppercase tracking-tight"
                >
                    <span className="block text-paper">{t.hero.firstName}</span>
                    <span className="block text-outline">{t.hero.lastName}</span>
                </motion.h1>

                <motion.p
                    variants={item}
                    className="mt-8 max-w-xl text-base leading-relaxed text-paper-dim sm:text-lg"
                >
                    {t.hero.lede}
                </motion.p>

                <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
                    <ButtonLink href="#projects">{t.hero.ctaProjects}</ButtonLink>
                    <ButtonLink href="#contact" variant="ghost">
                        {t.hero.ctaContact}
                    </ButtonLink>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute inset-x-0 bottom-0"
            >
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-t hairline px-5 py-5 sm:px-8">
                    <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim">
                        <span className="size-1.5 animate-pulse-dot rounded-full bg-ember" />
                        {t.hero.status}
                    </span>
                    <a
                        href="#about"
                        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint transition-colors hover:text-ember"
                    >
                        {t.hero.scroll}
                        <motion.span
                            animate={{ y: [0, 4, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <ArrowDown size={12} />
                        </motion.span>
                    </a>
                </div>
            </motion.div>
        </section>
    )
}
