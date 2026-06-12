import { SKILL_GROUPS } from '@/entities/skill'
import { Section, Reveal } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

export function Stack() {
    const { t, lx } = useI18n()

    return (
        <Section id="stack" index="05" title={t.stack.title} subtitle={t.stack.subtitle}>
            <div>
                {SKILL_GROUPS.map((group, i) => (
                    <Reveal key={group.id} delay={i * 0.06}>
                        <div className="grid grid-cols-1 gap-3 border-b hairline py-6 sm:grid-cols-12 sm:gap-6">
                            <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-ember sm:col-span-3 sm:pt-1">
                                {lx(group.name)}
                            </h3>
                            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-9">
                                {group.items.map((item) => (
                                    <li
                                        key={item}
                                        className="cursor-default text-lg text-paper-dim transition-colors duration-200 hover:text-paper"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>
                ))}
            </div>
        </Section>
    )
}
