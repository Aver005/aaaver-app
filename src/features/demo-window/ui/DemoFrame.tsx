import { useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import type { Dict } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'
import { demoUrl, demoWindow } from '../model/store'

/**
 * Демки — собственный код автора и раздаются с того же origin, поэтому
 * `allow-same-origin` оставлен: шрифты, fetch и localStorage демки работают
 * как в отдельной вкладке. Граница доверия — «свой код»: в песочнице нет
 * только навигации родителя, увести с сайта демка не может.
 */
const SANDBOX = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals'

interface DemoFrameProps {
    slug: string
    title: string
    label: Dict['demo']
}

/** Заголовок окна и iframe. Монтируется заново на каждый слаг — загрузка не течёт между демками */
export function DemoFrame({ slug, title, label }: DemoFrameProps) {
    const [loaded, setLoaded] = useState(false)
    const url = demoUrl(slug)

    return (
        <>
            <div className="flex h-11 shrink-0 items-center gap-4 border-b hairline px-4 font-mono text-[11px] uppercase tracking-[0.18em]">
                <span className="text-paper-faint">
                    {label.path}
                    <span className="text-paper">{slug}</span>
                </span>
                <h2 id="demo-window-title" className="truncate text-paper-dim normal-case tracking-normal">
                    {title}
                </h2>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-paper-dim transition-colors hover:text-ember"
                >
                    {label.openSeparately}
                    <ArrowUpRight size={13} />
                </a>
                <button
                    type="button"
                    onClick={demoWindow.close}
                    aria-label={label.close}
                    className="-mr-2 inline-flex size-8 cursor-pointer items-center justify-center text-paper-dim transition-colors hover:text-paper"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="relative min-h-0 flex-1 bg-ink">
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-paper-faint">
                        {label.loading}
                    </div>
                )}
                <iframe
                    src={url}
                    title={title}
                    sandbox={SANDBOX}
                    onLoad={() => setLoaded(true)}
                    className={cn(
                        'h-full w-full border-0 transition-opacity duration-300',
                        loaded ? 'opacity-100' : 'opacity-0',
                    )}
                />
            </div>
        </>
    )
}
