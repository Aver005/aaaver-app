import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCheckIcon, FileText, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { useContactForm, type FormError } from '../model/useContactForm'
import { SlideToSend, type SlideState } from './SlideToSend'
import { ConsentDialog } from './ConsentDialog'

const inputClass =
    'w-full border-b hairline bg-transparent py-3 text-paper placeholder:text-paper-faint focus:border-ember focus:outline-none transition-colors duration-300'

const labelClass = 'mb-1.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint'

export function ContactForm() {
    const { t } = useI18n()
    const { fields, setField, status, error, isValid, arm, submit } = useContactForm()
    const [resetSignal, setResetSignal] = useState(0)
    const [isConsentOpen, setIsConsentOpen] = useState(false)

    // после ошибки ползунок возвращается в начало
    useEffect(() => {
        if (status === 'error') setResetSignal((n) => n + 1)
    }, [status, error])

    const done = status === 'success'
    const consentHintHidden = fields.consent || done

    const slideState: SlideState =
        status === 'success'
            ? 'success'
            : status === 'sending'
              ? 'sending'
              : !isValid
                ? 'disabled'
                : status === 'arming'
                  ? 'arming'
                  : 'ready'

    const slideLabel: Record<SlideState, string> = {
        success: t.contact.slideDone,
        sending: t.contact.slideSending,
        arming: t.contact.slideArming,
        ready: t.contact.slideIdle,
        disabled: t.contact.slideIdle,
    }

    const errorText: Record<NonNullable<FormError>, string> = {
        validation: t.contact.errValidation,
        'rate-limit': t.contact.errRateLimit,
        captcha: t.contact.errCaptcha,
        server: t.contact.errServer,
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="relative flex flex-col gap-7" noValidate>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <label className="block">
                    <span className={labelClass}>{t.contact.nameLabel}</span>
                    <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        maxLength={100}
                        value={fields.name}
                        onChange={(e) => setField('name', e.target.value)}
                        onFocus={arm}
                        placeholder={t.contact.namePh}
                        className={inputClass}
                        disabled={done}
                    />
                </label>

                <label className="block">
                    <span className={labelClass}>{t.contact.contactLabel}</span>
                    <input
                        type="text"
                        name="reach"
                        autoComplete="off"
                        maxLength={150}
                        value={fields.contact}
                        onChange={(e) => setField('contact', e.target.value)}
                        onFocus={arm}
                        placeholder={t.contact.contactPh}
                        className={inputClass}
                        disabled={done}
                    />
                </label>
            </div>

            <label className="block">
                <span className={labelClass}>{t.contact.messageLabel}</span>
                <textarea
                    name="msg"
                    rows={4}
                    maxLength={4000}
                    value={fields.message}
                    onChange={(e) => setField('message', e.target.value)}
                    onFocus={arm}
                    placeholder={t.contact.messagePh}
                    className={cn(inputClass, 'resize-none')}
                    disabled={done}
                />
            </label>

            <div className="border hairline px-4 py-3">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <label className="flex cursor-pointer select-none items-start gap-2.5">
                        <input
                            type="checkbox"
                            name="consent"
                            checked={fields.consent}
                            onChange={(e) => setField('consent', e.target.checked)}
                            className="sr-only"
                            disabled={done}
                        />
                        <span
                            aria-hidden="true"
                            className={cn(
                                'mt-0.5 flex size-4.5 shrink-0 items-center justify-center border transition-colors duration-200',
                                fields.consent ? 'border-ember bg-ember text-ink' : 'border-line-strong text-transparent',
                            )}
                        >
                            <CheckCheckIcon size={11} />
                        </span>
                        <span className="text-sm leading-relaxed text-paper-dim">{t.contact.consentLabel}</span>
                    </label>

                    <button
                        type="button"
                        onClick={() => setIsConsentOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.18em] text-paper-faint transition-colors hover:text-paper"
                    >
                        <FileText size={14} />
                        {t.contact.consentOpen}
                    </button>
                </div>

                <p
                    className={cn(
                        'mt-2 min-h-5 text-xs leading-relaxed text-paper-faint transition-opacity duration-200',
                        consentHintHidden ? 'opacity-0' : 'opacity-100',
                    )}
                    aria-hidden={consentHintHidden}
                >
                    {t.contact.consentRequired}
                </p>
            </div>

            {/* honeypot: люди его не видят, боты заполняют */}
            <div aria-hidden="true" className="absolute -left-2499.75 top-0 h-0 w-0 overflow-hidden">
                <label>
                    Website
                    <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={fields.website}
                        onChange={(e) => setField('website', e.target.value)}
                    />
                </label>
            </div>

            <div>
                <SlideToSend
                    state={slideState}
                    label={slideLabel[slideState]}
                    onComplete={submit}
                    resetSignal={resetSignal}
                />
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-paper-faint">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-ember/70" />
                    {t.contact.hint}
                </p>
            </div>

            <AnimatePresence>
                {status === 'success' && (
                    <motion.p
                        key="ok"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-l-2 border-ember pl-4 text-sm text-paper"
                    >
                        {t.contact.success}
                    </motion.p>
                )}
                {status === 'error' && error && (
                    <motion.p
                        key={`err-${error}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="border-l-2 border-ember-deep pl-4 text-sm text-paper-dim"
                    >
                        {errorText[error]}
                    </motion.p>
                )}
            </AnimatePresence>

            <ConsentDialog open={isConsentOpen} onClose={() => setIsConsentOpen(false)} />
        </form>
    )
}
