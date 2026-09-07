import { motion, type Variants } from 'motion/react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { useRepos } from '@/entities/repo'
import { ButtonLink } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'
import { relativeTime } from '@/shared/lib/relativeTime'

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
}

const item: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] } },
}

interface SpecRow {
    key: string
    label: string
    value: string
    href?: string
}

export function Hero() {
    const { t, locale } = useI18n()
    const { repos } = useRepos()
    const latest = repos[0]
    const spec = t.hero.spec

    // Спецификация: каждая строка проверяема и по возможности ведёт на доказательство
    const rows: SpecRow[] = [
        { key: 'role', label: spec.role, value: spec.roleValue, href: 'https://rtatex.ru' },
        latest
            ? {
                  key: 'now',
                  label: spec.now,
                  value: `${spec.nowPrefix} ${latest.name} · ${relativeTime(latest.pushedAt, locale)}`,
                  href: latest.url,
              }
            : { key: 'now', label: spec.now, value: '—' },
        { key: 'languages', label: spec.languages, value: spec.languagesValue },
        { key: 'server', label: spec.server, value: spec.serverValue, href: SITE.repo },
        { key: 'offCode', label: spec.offCode, value: spec.offCodeValue },
    ]

    return (
        <section id="top" className="relative flex min-h-svh flex-col justify-center overflow-hidden">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pt-28 pb-32 sm:px-8 lg:grid-cols-12 lg:gap-8"
            >
                <div className="lg:col-span-8">
                    <motion.p
                        variants={item}
                        className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-ember sm:text-sm"
                    >
                        <span className="text-paper-faint">{'// '}</span>
                        {t.hero.kicker}
                    </motion.p>

                    <motion.h1
                        variants={item}
                        className="font-display text-[clamp(2.6rem,9vw,7.5rem)] leading-[1.02] uppercase tracking-tight text-paper"
                    >
                        <span className="block font-bold">{t.hero.firstName}</span>
                        <span className="block font-normal md:font-light">{t.hero.lastName}</span>
                    </motion.h1>

                    <motion.p
                        variants={item}
                        className="mt-8 max-w-2xl text-base leading-relaxed text-paper sm:text-lg"
                    >
                        {t.hero.lede}
                    </motion.p>
                    <motion.p variants={item} className="mt-4 max-w-xl text-sm leading-relaxed text-paper-dim">
                        {t.hero.bio}
                    </motion.p>

                    <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
                        <ButtonLink href="#projects">{t.hero.ctaProjects}</ButtonLink>
                        <ButtonLink href="#contact" variant="ghost">
                            {t.hero.ctaContact}
                        </ButtonLink>
                    </motion.div>
                </div>

                <motion.dl variants={item} className="self-end border-t hairline lg:col-span-4">
                    {rows.map((row) => (
                        <div
                            key={row.key}
                            className="grid grid-cols-[6rem_1fr] gap-4 border-b hairline py-3 font-mono text-xs tracking-[0.06em]"
                        >
                            <dt className="uppercase tracking-[0.18em] text-paper-faint">{row.label}</dt>
                            <dd className="text-paper-dim">
                                {row.href ? (
                                    <a
                                        href={row.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-ember"
                                    >
                                        {row.value}
                                        <ArrowUpRight size={12} className="text-paper-faint" />
                                    </a>
                                ) : (
                                    row.value
                                )}
                            </dd>
                        </div>
                    ))}
                </motion.dl>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="absolute inset-x-0 bottom-0 lg:bottom-7"
            >
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-t hairline px-5 py-5 sm:px-8">
                    <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim">
                        <span className="size-1.5 rounded-full bg-ember" />
                        {t.hero.status}
                    </span>
                    <a
                        href="#projects"
                        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint transition-colors hover:text-ember"
                    >
                        {t.hero.scroll}
                        <ArrowDown size={12} />
                    </a>
                </div>
            </motion.div>
        </section>
    )
}
