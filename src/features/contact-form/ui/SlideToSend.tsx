import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { ArrowRight, Check, LoaderCircle } from 'lucide-react'
import type { GestureStats } from '@/shared/api'
import { cn } from '@/shared/lib/cn'

export type SlideState = 'disabled' | 'arming' | 'ready' | 'sending' | 'success'

interface SlideToSendProps {
    state: SlideState
    label: string
    onComplete: (gesture: GestureStats) => void
    /** инкремент снаружи возвращает ползунок в начало (после ошибки) */
    resetSignal: number
}

const KNOB = 56
const PAD = 4

/**
 * Ползунок «проведите, чтобы отправить» — он же человеко-проверка:
 * жест с реальной траекторией движения сложно подделать тупому боту,
 * а статистика жеста уходит на сервер вместе с proof-of-work.
 */
export function SlideToSend({ state, label, onComplete, resetSignal }: SlideToSendProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const [maxDrag, setMaxDrag] = useState(0)

    const x = useMotionValue(0)
    const fillWidth = useTransform(x, (v) => v + KNOB + PAD * 2)
    const labelOpacity = useTransform(x, [0, Math.max(maxDrag * 0.6, 1)], [1, 0])

    const samplesRef = useRef(0)
    const distanceRef = useRef(0)
    const startedAtRef = useRef(0)

    useLayoutEffect(() => {
        const el = trackRef.current
        if (!el) return
        const measure = () => setMaxDrag(Math.max(el.clientWidth - KNOB - PAD * 2, 0))
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // возврат в начало после ошибки
    useEffect(() => {
        if (resetSignal > 0) animate(x, 0, { type: 'spring', stiffness: 300, damping: 32 })
    }, [resetSignal, x])

    // в успехе ползунок остаётся справа
    useEffect(() => {
        if (state === 'success' && maxDrag > 0) {
            animate(x, maxDrag, { type: 'spring', stiffness: 300, damping: 32 })
        }
    }, [state, maxDrag, x])

    const finish = () => {
        onComplete({
            durationMs: Math.round(performance.now() - startedAtRef.current),
            samples: samplesRef.current,
            distance: Math.round(distanceRef.current),
        })
    }

    const canDrag = state === 'ready'
    const Icon =
        state === 'success' ? Check : state === 'arming' || state === 'sending' ? LoaderCircle : ArrowRight

    return (
        <div
            ref={trackRef}
            className={cn(
                'relative h-16 overflow-hidden border bg-ink-raise transition-colors duration-500',
                state === 'success' ? 'border-ember' : 'hairline',
                state === 'disabled' && 'opacity-50',
            )}
        >
            <motion.div
                aria-hidden="true"
                className={cn(
                    'absolute inset-y-0 left-0',
                    state === 'success' ? 'bg-ember/25' : 'bg-ember/15',
                )}
                style={{ width: fillWidth }}
            />

            <motion.span
                aria-hidden="true"
                style={{ opacity: state === 'success' ? 1 : labelOpacity }}
                className={cn(
                    'pointer-events-none absolute inset-0 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.24em]',
                    state === 'success' ? 'text-ember' : 'text-paper-dim',
                )}
            >
                {label}
                {state === 'ready' && (
                    <motion.span
                        className="text-ember"
                        animate={{ opacity: [0.2, 1, 0.2], x: [0, 4, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        ›››
                    </motion.span>
                )}
            </motion.span>

            <motion.button
                type="button"
                aria-label={label}
                disabled={state === 'disabled' || state === 'sending' || state === 'success'}
                onKeyDown={(e) => {
                    if (canDrag && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        startedAtRef.current = performance.now()
                        samplesRef.current = 0
                        distanceRef.current = 0
                        animate(x, maxDrag, { type: 'spring', stiffness: 200, damping: 30 })
                        finish()
                    }
                }}
                drag={canDrag ? 'x' : false}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.02}
                dragMomentum={false}
                onDragStart={() => {
                    startedAtRef.current = performance.now()
                    samplesRef.current = 0
                    distanceRef.current = 0
                }}
                onDrag={(_, info) => {
                    samplesRef.current = Math.min(samplesRef.current + 1, 2000)
                    distanceRef.current += Math.abs(info.delta.x)
                }}
                onDragEnd={() => {
                    if (x.get() >= maxDrag * 0.92 && canDrag) {
                        animate(x, maxDrag, { type: 'spring', stiffness: 400, damping: 36 })
                        finish()
                    } else {
                        animate(x, 0, { type: 'spring', stiffness: 380, damping: 34 })
                    }
                }}
                style={{ x, width: KNOB, top: PAD, bottom: PAD, left: PAD }}
                className={cn(
                    'absolute z-10 flex items-center justify-center transition-colors duration-300',
                    state === 'success' ? 'bg-ember text-ink' : 'bg-ember text-ink hover:bg-ember-bright',
                    canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
                )}
            >
                <Icon
                    size={20}
                    strokeWidth={2.5}
                    className={state === 'arming' || state === 'sending' ? 'animate-spin' : undefined}
                />
            </motion.button>
        </div>
    )
}
