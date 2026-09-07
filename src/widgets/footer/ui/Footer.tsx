import { ArrowUp } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import { SITE } from '@/shared/config/site'

/** Колофон: чем набрано и на чём работает — единственный «печатный» приём, который для сайта правда */
export function Footer() {
    const { t } = useI18n()

    return (
        <footer className="mt-28 border-t hairline sm:mt-40">
            <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-12 lg:gap-8">
                <p className="max-w-md text-xs leading-relaxed text-paper-faint lg:col-span-7">
                    {t.footer.colophon}{' '}
                    <a
                        href={SITE.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-paper-faint/40 underline-offset-4 transition-colors hover:text-ember"
                    >
                        {t.footer.source}
                    </a>
                    .
                </p>
                <div className="flex items-center justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-faint lg:col-span-5 lg:justify-end lg:gap-10">
                    <span>{t.footer.rights}</span>
                    <a href="#top" className="flex items-center gap-2 transition-colors hover:text-ember">
                        {t.footer.top}
                        <ArrowUp size={12} />
                    </a>
                </div>
            </div>
        </footer>
    )
}
