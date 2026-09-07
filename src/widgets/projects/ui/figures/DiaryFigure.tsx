/**
 * Схема diary вместо скриншота: у бота нет экрана, зато есть архитектура.
 * Лёгкий сервер на VDS, тяжёлый счёт дома; воркер приходит за задачами сам.
 */
export function DiaryFigure() {
    return (
        <figure className="flex h-full flex-col justify-center gap-3 border hairline bg-ink-raise p-6 font-mono text-xs text-paper-dim sm:p-8">
            <Node title="telegram" note="voice → text · calendar" />
            <Arrow label="webhook" />
            <Node title="vds · bun.serve" note="postgres · queue · 0 deps" accent />
            <Arrow label="worker pulls jobs · never dialed in" flip />
            <Node title="home · gpu" note="parakeet asr · llm · docker" />
        </figure>
    )
}

function Node({ title, note, accent = false }: { title: string; note: string; accent?: boolean }) {
    return (
        <div className={`flex items-baseline justify-between gap-4 border px-4 py-3 ${accent ? 'border-ember/60 text-paper' : 'hairline'}`}>
            <span className="uppercase tracking-[0.18em]">{title}</span>
            <span className="text-[11px] text-paper-faint">{note}</span>
        </div>
    )
}

function Arrow({ label, flip = false }: { label: string; flip?: boolean }) {
    return (
        <div className="flex items-center gap-3 pl-4 text-[11px] text-paper-faint">
            <span aria-hidden="true">{flip ? '↑' : '↓'}</span>
            <span>{label}</span>
        </div>
    )
}
