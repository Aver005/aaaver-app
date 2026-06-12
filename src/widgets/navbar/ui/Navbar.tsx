import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { LocaleSwitch } from '@/features/locale-switch'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'

const SECTIONS = ['about', 'experience', 'projects', 'opensource', 'stack', 'contact'] as const

export function Navbar() {
    const { t } = useI18n()
    const [scrolled, setScrolled] = useState(false)
    const [open, setOpen] = useState(false)
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 32))

    // блокируем прокрутку под мобильным меню
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    return (
        <>
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-50 transition-all duration-500',
                    scrolled ? 'border-b hairline bg-ink/80 backdrop-blur-md' : 'bg-transparent',
                )}
            >
                <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
                    <a
                        href="#top"
                        className="font-mono text-sm font-medium tracking-[0.18em] text-paper"
                        onClick={() => setOpen(false)}
                    >
                        aaaver<span className="text-ember">.ru</span>
                    </a>

                    <div className="hidden items-center gap-8 md:flex">
                        {SECTIONS.map((id, i) => (
                            <a
                                key={id}
                                href={`#${id}`}
                                className="group font-mono text-xs uppercase tracking-[0.18em] text-paper-dim transition-colors hover:text-paper"
                            >
                                <span className="mr-1.5 text-ember/60 transition-colors group-hover:text-ember">
                                    0{i + 1}
                                </span>
                                {t.nav[id]}
                            </a>
                        ))}
                        <LocaleSwitch />
                    </div>

                    <div className="flex items-center gap-5 md:hidden">
                        <LocaleSwitch />
                        <button
                            type="button"
                            aria-label={open ? t.nav.menuClose : t.nav.menuOpen}
                            aria-expanded={open}
                            onClick={() => setOpen((v) => !v)}
                            className="cursor-pointer text-paper"
                        >
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </nav>
            </header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-40 flex flex-col justify-center bg-ink/95 px-8 backdrop-blur-lg md:hidden"
                    >
                        {SECTIONS.map((id, i) => (
                            <motion.a
                                key={id}
                                href={`#${id}`}
                                onClick={() => setOpen(false)}
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.06 * i + 0.1, duration: 0.4 }}
                                className="border-b hairline py-5 font-display text-2xl font-semibold uppercase tracking-tight text-paper active:text-ember"
                            >
                                <span className="mr-4 font-mono text-sm text-ember">0{i + 1}</span>
                                {t.nav[id]}
                            </motion.a>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
