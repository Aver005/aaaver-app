import { useEffect } from 'react'
import { Overlay } from '@/shared/ui'
import { useI18n } from '@/shared/i18n'
import { demoWindow, useDemoWindow } from '../model/store'
import { DemoFrame } from './DemoFrame'

/** Хост окна демки: монтируется один раз на странице */
export function DemoWindow() {
    const { t } = useI18n()
    const target = useDemoWindow()

    useEffect(() => {
        window.addEventListener('popstate', demoWindow.onPopState)
        return () => window.removeEventListener('popstate', demoWindow.onPopState)
    }, [])

    return (
        <Overlay
            open={target !== null}
            onClose={demoWindow.close}
            labelledBy="demo-window-title"
            className="h-[min(88vh,900px)] w-full max-w-6xl overflow-hidden rounded-md border hairline bg-ink-raise shadow-overlay"
        >
            {target && <DemoFrame key={target.slug} slug={target.slug} title={target.title} label={t.demo} />}
        </Overlay>
    )
}
