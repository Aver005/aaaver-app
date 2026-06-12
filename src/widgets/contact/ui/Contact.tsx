import { ArrowUpRight, Github, Mail, Send } from 'lucide-react'
import { ContactForm } from '@/features/contact-form'
import { Section, Reveal } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'

const CHANNELS = [
    { id: 'telegram', icon: Send, label: SITE.telegramHandle, href: SITE.telegram },
    { id: 'email', icon: Mail, label: SITE.email, href: `mailto:${SITE.email}` },
    { id: 'github', icon: Github, label: 'github.com/Aver005', href: SITE.github },
] as const

export function Contact() {
    const { t } = useI18n()

    return (
        <Section id="contact" index="06" title={t.contact.title} subtitle={t.contact.subtitle}>
            <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <Reveal>
                        <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-paper-faint">
                            {t.contact.channelsLabel}
                        </h3>
                        <ul className="mt-2">
                            {CHANNELS.map(({ id, icon: Icon, label, href }) => (
                                <li key={id}>
                                    <a
                                        href={href}
                                        target={id === 'email' ? undefined : '_blank'}
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-between border-b hairline py-4.5 transition-colors hover:border-ember/50"
                                    >
                                        <span className="flex items-center gap-3.5 font-mono text-sm text-paper-dim transition-colors group-hover:text-paper">
                                            <Icon size={16} className="text-ember" />
                                            {label}
                                        </span>
                                        <ArrowUpRight
                                            size={15}
                                            className="text-paper-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ember"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </div>

                <div className="relative lg:col-span-7">
                    <Reveal delay={0.12}>
                        <ContactForm />
                    </Reveal>
                </div>
            </div>
        </Section>
    )
}
