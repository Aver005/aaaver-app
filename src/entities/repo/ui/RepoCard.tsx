import { Star } from 'lucide-react'
import type { RepoInfo } from '@/shared/api'
import { useI18n } from '@/shared/i18n'

const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Rust: '#dea584',
    Python: '#3572a5',
    Java: '#b07219',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
}

export function RepoCard({ repo }: { repo: RepoInfo }) {
    const { locale } = useI18n()
    const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? '#8b8b8b') : null

    return (
        <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col border hairline p-5 transition-colors duration-300 hover:border-ember/60 hover:bg-ink-raise"
        >
            <h3 className="font-mono text-sm font-medium text-paper transition-colors duration-300 group-hover:text-ember">
                {repo.name}
            </h3>
            <p className="mt-2.5 line-clamp-3 grow text-sm leading-relaxed text-paper-dim">
                {repo.description ?? (locale === 'ru' ? 'Без описания — но с кодом.' : 'No description — just code.')}
            </p>
            <div className="mt-5 flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-paper-faint">
                {repo.language && (
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full"
                            style={{ backgroundColor: langColor ?? undefined }}
                        />
                        {repo.language}
                    </span>
                )}
                {repo.stars > 0 && (
                    <span className="inline-flex items-center gap-1">
                        <Star size={11} />
                        {repo.stars}
                    </span>
                )}
            </div>
        </a>
    )
}
