import { Link, useLocation } from 'react-router'
import { useI18n } from '@/shared/i18n'
import { PAGES } from '@/shared/config/seo'
import { cn } from '@/shared/lib/cn'

/** Настоящая ссылка на другую языковую версию: её видят поисковики, работает средняя кнопка */
export function LocaleSwitch({ className }: { className?: string }) {
    const { locale, t } = useI18n()
    const { hash } = useLocation()
    const target = PAGES[locale === 'ru' ? 'en' : 'ru']

    return (
        <Link
            to={{ pathname: target.path, hash }}
            hrefLang={locale === 'ru' ? 'en' : 'ru'}
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
        </Link>
    )
}
