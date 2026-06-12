import { ArrowUpRight } from 'lucide-react'
import { JOBS } from '@/entities/experience'
import { Section, Reveal } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

export function Experience() {
    const { t, lx } = useI18n()

    return (
        <Section id="experience" index="02" title={t.experience.title}>
            <div>
                {JOBS.map((job, i) => (
                    <Reveal key={job.id} delay={i * 0.07}>
                        <article className="group grid grid-cols-1 gap-2 border-b hairline py-7 transition-colors duration-300 hover:bg-ink-raise sm:grid-cols-12 sm:gap-6 sm:px-4 sm:-mx-4">
                            <div className="font-mono text-xs tracking-[0.14em] text-paper-faint sm:col-span-2 sm:pt-1.5">
                                {job.from} — {job.to ?? t.experience.present}
                            </div>
                            <h3 className="font-display text-lg font-semibold text-paper sm:col-span-3">
                                {job.companyUrl ? (
                                    <a
                                        href={job.companyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 transition-colors hover:text-ember"
                                    >
                                        {lx(job.company)}
                                        <ArrowUpRight size={14} className="text-paper-faint" />
                                    </a>
                                ) : (
                                    lx(job.company)
                                )}
                            </h3>
                            <div className="text-sm text-paper sm:col-span-3 sm:pt-1">{lx(job.role)}</div>
                            <p className="text-sm leading-relaxed text-paper-dim sm:col-span-4 sm:pt-1">
                                {lx(job.description)}
                            </p>
                        </article>
                    </Reveal>
                ))}
            </div>
        </Section>
    )
}
