import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
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

    // после ошибки ползунок возвращается в начало
    useEffect(() => {
        if (status === 'error') setResetSignal((n) => n + 1)
    }, [status, error])

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

            {/* honeypot: люди его не видят, боты заполняют */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
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
        </form>
    )
}
