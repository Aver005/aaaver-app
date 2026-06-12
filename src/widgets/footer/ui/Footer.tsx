import { ArrowUp } from 'lucide-react'
import { useI18n } from '@/shared/i18n'

const REPO_URL = 'https://github.com/Aver005/aaaver-app'

export function Footer() {
    const { t } = useI18n()

    return (
        <footer className="mt-28 border-t hairline sm:mt-40">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-7 sm:px-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-faint">
                    {t.footer.rights}
                </span>
                <span className="text-xs text-paper-faint">
                    {t.footer.builtWith}
                    {' · '}
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-paper-faint/40 underline-offset-4 transition-colors hover:text-ember"
                    >
                        {t.footer.source}
                    </a>
                </span>
                <a
                    href="#top"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-faint transition-colors hover:text-ember"
                >
                    {t.footer.top}
                    <ArrowUp size={12} />
                </a>
            </div>
        </footer>
    )
}
