import { Section, Reveal } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

export function About() {
    const { t } = useI18n()

    return (
        <Section id="about" index="01" title={t.about.title}>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-7">
                    <Reveal>
                        <p className="font-display text-2xl leading-snug font-medium sm:text-[2.4rem]">
                            <span className="text-ember">{t.about.statementA}</span>{' '}
                            <span className="text-paper">{t.about.statementB}</span>
                        </p>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <p className="mt-8 max-w-xl leading-relaxed text-paper-dim">{t.about.body}</p>
                    </Reveal>
                </div>

                <div className="lg:col-span-5">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                        {t.about.facts.map((fact, i) => (
                            <Reveal key={fact.label} delay={0.1 + i * 0.08}>
                                <div className="border-t hairline pt-4">
                                    <div className="font-display text-4xl font-semibold text-ember sm:text-5xl">
                                        {fact.value}
                                    </div>
                                    <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-paper-faint">
                                        {fact.label}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    )
}
