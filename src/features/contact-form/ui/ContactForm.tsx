import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCheckIcon, FileText, ShieldCheck, X } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { useContactForm, type FormError } from '../model/useContactForm'
import { SlideToSend, type SlideState } from './SlideToSend'

const inputClass =
    'w-full border-b hairline bg-transparent py-3 text-paper placeholder:text-paper-faint focus:border-ember focus:outline-none transition-colors duration-300'

export function ContactForm() {
    const { t } = useI18n()
    const { fields, setField, status, error, isValid, arm, submit } = useContactForm()
    const [resetSignal, setResetSignal] = useState(0)
    const [isConsentOpen, setIsConsentOpen] = useState(false)

    // после ошибки ползунок возвращается в начало
    useEffect(() => {
        if (status === 'error') setResetSignal((n) => n + 1)
    }, [status, error])

    useEffect(() => {
        if (!isConsentOpen) return

        const previousOverflow = document.body.style.overflow
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsConsentOpen(false)
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isConsentOpen])

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

    const slideLabel =
        slideState === 'success'
            ? t.contact.slideDone
            : slideState === 'sending'
              ? t.contact.slideSending
              : slideState === 'arming'
                ? t.contact.slideArming
                : t.contact.slideIdle

    const errorText: Record<NonNullable<FormError>, string> = {
        validation: t.contact.errValidation,
        'rate-limit': t.contact.errRateLimit,
        captcha: t.contact.errCaptcha,
        server: t.contact.errServer,
    }

    return (
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-7" noValidate>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <label className="block">
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
                        {t.contact.nameLabel}
                    </span>
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
                        disabled={status === 'success'}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
                        {t.contact.contactLabel}
                    </span>
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
                        disabled={status === 'success'}
                    />
                </label>
            </div>

            <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint">
                    {t.contact.messageLabel}
                </span>
                <textarea
                    name="msg"
                    rows={4}
                    maxLength={4000}
                    value={fields.message}
                    onChange={(e) => setField('message', e.target.value)}
                    onFocus={arm}
                    placeholder={t.contact.messagePh}
                    className={cn(inputClass, 'resize-none')}
                    disabled={status === 'success'}
                />
            </label>

            <div className="rounded-lg bg-white/2 px-4 py-3 sm:px-4.5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <label className="flex select-none cursor-pointer items-start gap-2.5">
                        <input
                            type="checkbox"
                            name="consent"
                            checked={fields.consent}
                            onChange={(e) => setField('consent', e.target.checked)}
                            className="sr-only"
                            disabled={status === 'success'}
                        />
                        <span
                            aria-hidden="true"
                            className={cn(
                                'mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200',
                                fields.consent
                                    ? 'border-ember/80 bg-ember/90 text-ink'
                                    : 'border-white/14 bg-transparent text-transparent',
                            )}
                        >
                            <CheckCheckIcon size={11} />
                        </span>
                        <span className="text-sm leading-relaxed text-paper-dim/90">{t.contact.consentLabel}</span>
                    </label>

                    <button
                        type="button"
                        onClick={() => setIsConsentOpen(true)}
                        className="inline-flex items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.18em] text-paper-faint transition-colors hover:text-paper"
                    >
                        <FileText size={14} />
                        {t.contact.consentOpen}
                    </button>
                </div>

                <div className="mt-2 min-h-5">
                    <p
                        className={cn(
                            'text-xs leading-relaxed transition-opacity duration-200',
                            'opacity-100 text-paper-faint'
                        )}
                        aria-hidden={fields.consent || status === 'success'}
                    >
                        {t.contact.consentRequired}
                    </p>
                </div>
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
                    label={slideLabel}
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

            <AnimatePresence>
                {isConsentOpen && (
                    <motion.div
                        key="consent-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-120 flex items-center justify-center bg-ink/88 px-4 py-6 backdrop-blur-md"
                        onClick={() => setIsConsentOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="consent-title"
                            className="relative flex max-h-[min(90vh,780px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-ink-raise shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ember/70 to-transparent" />

                            <div className="flex items-start justify-between gap-4 border-b hairline px-5 py-5 sm:px-7">
                                <div className="space-y-2">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper-faint">
                                        152-ФЗ / consent
                                    </p>
                                    <h3 id="consent-title" className="max-w-xl text-xl leading-tight text-paper sm:text-2xl">
                                        {t.contact.consentModalTitle}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsConsentOpen(false)}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border hairline text-paper-faint transition-colors hover:border-ember/40 hover:text-paper"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                                <p className="max-w-2xl text-sm leading-relaxed text-paper-dim">
                                    {t.contact.consentModalLead}
                                </p>

                                <div className="mt-6 grid gap-4">
                                    {t.contact.consentSections.map((section) => (
                                        <section
                                            key={section.title}
                                            className="rounded-[22px] border hairline bg-ink/45 p-4 sm:p-5"
                                        >
                                            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">
                                                {section.title}
                                            </h4>
                                            <p className="mt-3 text-sm leading-relaxed text-paper-dim">{section.body}</p>
                                        </section>
                                    ))}
                                </div>
                            </div>

                            <div className="shrink-0 border-t hairline bg-ink-raise/95 px-5 py-5 sm:px-7">
                                <button
                                    type="button"
                                    onClick={() => setIsConsentOpen(false)}
                                    className="inline-flex w-full items-center justify-center rounded-full bg-ember px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ember-bright"
                                >
                                    {t.contact.consentClose}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    )
}
