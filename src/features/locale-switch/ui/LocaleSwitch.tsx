import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'

export function LocaleSwitch({ className }: { className?: string }) {
    const { locale, toggleLocale, t } = useI18n()

    return (
        <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.nav.localeSwitch}
            className={cn(
                'group flex cursor-pointer items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em]',
                className,
            )}
        >
            <span className={locale === 'ru' ? 'text-ember' : 'text-paper-faint group-hover:text-paper-dim'}>
                ру
            </span>
            <span className="text-paper-faint">/</span>
            <span className={locale === 'en' ? 'text-ember' : 'text-paper-faint group-hover:text-paper-dim'}>
                en
            </span>
        </button>
    )
}
