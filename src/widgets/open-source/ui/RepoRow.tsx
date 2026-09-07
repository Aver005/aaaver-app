import { ArrowUpRight, Star } from 'lucide-react'
import { languageColor } from '@/entities/repo'
import type { RepoInfo } from '@/shared/api'
import { useI18n } from '@/shared/i18n'
import { relativeTime } from '@/shared/lib/relativeTime'

/** Звёзды показываем, когда их есть смысл показывать */
const STARS_MIN = 10

interface RepoRowProps {
    repo: RepoInfo
    /** Описание из данных проектов, если на GitHub его нет */
    fallbackDescription?: string
}

export function RepoRow({ repo, fallbackDescription }: RepoRowProps) {
    const { t, locale } = useI18n()
    const description = repo.description ?? fallbackDescription ?? t.openSource.noDescription

    return (
        <li>
            <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-1 gap-1.5 border-b hairline py-4 transition-colors hover:bg-ink-raise sm:-mx-4 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:px-4"
            >
                <span className="flex items-center gap-2 font-mono text-sm text-paper transition-colors group-hover:text-ember sm:col-span-3">
                    {repo.name}
                    <ArrowUpRight
                        size={13}
                        className="text-paper-faint opacity-0 transition-opacity group-hover:opacity-100"
                    />
                </span>
                <span className="text-sm leading-relaxed text-paper-dim sm:col-span-6 sm:line-clamp-1">{description}</span>
                <span className="flex items-center gap-4 font-mono text-[11px] tracking-[0.08em] text-paper-faint sm:col-span-3 sm:justify-end">
                    {repo.language && (
                        <span className="inline-flex items-center gap-1.5">
                            <span
                                aria-hidden="true"
                                className="size-2 rounded-full"
                                style={{ backgroundColor: languageColor(repo.language) }}
                            />
                            {repo.language}
                        </span>
                    )}
                    {repo.stars >= STARS_MIN && (
                        <span className="inline-flex items-center gap-1">
                            <Star size={11} />
                            {repo.stars}
                        </span>
                    )}
                    <span>{relativeTime(repo.pushedAt, locale)}</span>
                </span>
            </a>
        </li>
    )
}
