import { useCallback, useRef, useState } from 'react'
import {
    fetchChallenge,
    sendContact,
    type ContactResult,
    type GestureStats,
    type PowChallenge,
} from '@/shared/api'
import { solvePow, type PowSolution } from '@/shared/lib/pow'
import { useI18n } from '@/shared/i18n'

export type FormStatus = 'idle' | 'arming' | 'ready' | 'sending' | 'success' | 'error'
export type FormError = Exclude<ContactResult, { ok: true }>['error'] | null

interface Fields {
    name: string
    contact: string
    message: string
    website: string // honeypot
    consent: boolean
}

const EMPTY: Fields = { name: '', contact: '', message: '', website: '', consent: false }

/**
 * Машина состояний формы. Proof-of-work начинает решаться в фоне
 * при первом касании формы, так что к моменту отправки nonce обычно
 * уже готов и пользователь не ждёт ничего.
 */
export function useContactForm() {
    const { locale } = useI18n()
    const [fields, setFields] = useState<Fields>(EMPTY)
    const [status, setStatus] = useState<FormStatus>('idle')
    const [error, setError] = useState<FormError>(null)

    const challengeRef = useRef<PowChallenge | null>(null)
    const solutionRef = useRef<PowSolution | null>(null)
    const armingRef = useRef<Promise<void> | null>(null)
    const armedAtRef = useRef(0)

    const isValid =
        fields.name.trim().length >= 2 &&
        fields.contact.trim().length >= 3 &&
        fields.message.trim().length >= 10 &&
        fields.consent

    const setField = useCallback(<K extends keyof Fields>(key: K, value: Fields[K]) => {
        setFields((prev) => ({ ...prev, [key]: value }) as Fields)
    }, [])

    const arm = useCallback(() => {
        if (armingRef.current || solutionRef.current) return armingRef.current ?? Promise.resolve()
        const job = (async () => {
            setStatus((s) => (s === 'idle' ? 'arming' : s))
            try {
                const challenge = await fetchChallenge()
                challengeRef.current = challenge
                armedAtRef.current = performance.now()
                solutionRef.current = await solvePow(challenge.salt, challenge.difficulty)
                setStatus((s) => (s === 'arming' || s === 'idle' ? 'ready' : s))
            } catch {
                // сеть могла моргнуть — попробуем ещё раз при отправке
                armingRef.current = null
                setStatus((s) => (s === 'arming' ? 'idle' : s))
            }
        })()
        armingRef.current = job
        return job
    }, [])

    const rearm = useCallback(() => {
        challengeRef.current = null
        solutionRef.current = null
        armingRef.current = null
        return arm()
    }, [arm])

    const submit = useCallback(
        async (gesture: GestureStats) => {
            if (!isValid || status === 'sending' || status === 'success') return

            setStatus('sending')
            setError(null)

            // если решение ещё не готово (или challenge протух) — дорешиваем
            if (!solutionRef.current) await (armingRef.current ?? arm())
            const challenge = challengeRef.current
            const solution = solutionRef.current
            if (!challenge || !solution) {
                setError('server')
                setStatus('error')
                return
            }
            if (challenge.expiresAt < Date.now()) {
                await rearm()
            }

            const freshChallenge = challengeRef.current
            const freshSolution = solutionRef.current
            if (!freshChallenge || !freshSolution) {
                setError('server')
                setStatus('error')
                return
            }

            const result = await sendContact({
                challengeId: freshChallenge.id,
                nonce: freshSolution.nonce,
                name: fields.name.trim(),
                contact: fields.contact.trim(),
                message: fields.message.trim(),
                website: fields.website,
                gesture,
                elapsedMs: Math.round(performance.now() - armedAtRef.current),
                locale,
            })

            if (result.ok) {
                setStatus('success')
                return
            }

            setError(result.error)
            setStatus('error')
            // challenge одноразовый — на повторную попытку нужен новый
            void rearm()
        },
        [arm, fields, isValid, locale, rearm, status],
    )

    return { fields, setField, status, error, isValid, arm, submit }
}
