import { useRepos } from '@/entities/repo'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'
import { relativeTime } from '@/shared/lib/relativeTime'
import { useClock } from '../model/useClock'

/**
 * Нижняя строка как у TUI: только живые данные — последний пуш на GitHub,
 * время автора, статус. Десктоп; на телефоне ту же роль играет строка под hero.
 */
export function StatusBar() {
    const { t, locale } = useI18n()
    const { repos } = useRepos()
    const time = useClock(SITE.timeZone, locale)
    const latest = repos[0]

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 hidden h-7 items-center justify-between gap-6 border-t hairline bg-ink/90 px-8 font-mono text-[11px] tracking-[0.12em] text-paper-faint backdrop-blur-sm lg:flex">
            {latest && (
                <span className="truncate">
                    {t.statusBar.lastPush}:{' '}
                    <a
                        href={latest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-paper-dim transition-colors hover:text-ember"
                    >
                        {latest.name}
                    </a>
                    {' · '}
                    {relativeTime(latest.pushedAt, locale)}
                </span>
            )}
            <span>
                {t.statusBar.localTime} {time} · utc+3
            </span>
            <span className="text-paper-dim">{t.statusBar.open}</span>
        </div>
    )
}
