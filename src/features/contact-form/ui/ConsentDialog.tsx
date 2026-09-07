import { X } from 'lucide-react'
import { Overlay } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'

interface ConsentDialogProps {
    open: boolean
    onClose: () => void
}

/** Текст согласия по 152-ФЗ в модальном окне */
export function ConsentDialog({ open, onClose }: ConsentDialogProps) {
    const { t } = useI18n()

    return (
        <Overlay
            open={open}
            onClose={onClose}
            labelledBy="consent-title"
            className="max-h-[min(90vh,780px)] w-full max-w-3xl overflow-hidden rounded-md border hairline bg-ink-raise shadow-overlay"
        >
            <div className="flex items-start justify-between gap-4 border-b hairline px-5 py-5 sm:px-7">
                <div className="space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint">152-ФЗ / consent</p>
                    <h3 id="consent-title" className="max-w-xl text-xl leading-tight text-paper sm:text-2xl">
                        {t.contact.consentModalTitle}
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center border hairline text-paper-faint transition-colors hover:border-ember/40 hover:text-paper"
                    aria-label={t.contact.consentClose}
                >
                    <X size={16} />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                <p className="max-w-2xl text-sm leading-relaxed text-paper-dim">{t.contact.consentModalLead}</p>
                <div className="mt-6 grid gap-4">
                    {t.contact.consentSections.map((section) => (
                        <section key={section.title} className="border hairline bg-ink/45 p-4 sm:p-5">
                            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">{section.title}</h4>
                            <p className="mt-3 text-sm leading-relaxed text-paper-dim">{section.body}</p>
                        </section>
                    ))}
                </div>
            </div>

            <div className="shrink-0 border-t hairline px-5 py-5 sm:px-7">
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex w-full cursor-pointer items-center justify-center bg-ember px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ember-bright"
                >
                    {t.contact.consentClose}
                </button>
            </div>
        </Overlay>
    )
}
