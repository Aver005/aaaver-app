import { KIND_LABELS, STATUS_LABELS, periodLabel, type Project } from '@/entities/project'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'

interface ProjectMetaProps {
    project: Project
    /** «01» — номер пластины; у строк его нет */
    number?: string
    live?: boolean
    className?: string
}

/** Строка характеристик: номер · вид · статус · период · живая демка */
export function ProjectMeta({ project, number, live, className }: ProjectMetaProps) {
    const { t, locale } = useI18n()
    const parts = [
        KIND_LABELS[locale][project.kind],
        STATUS_LABELS[locale][project.status],
        periodLabel(project.period, t.projects.present),
    ]

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-faint',
                className,
            )}
        >
            {number && <span className="text-ember">fig.{number}</span>}
            {parts.map((part) => (
                <span key={part}>{part}</span>
            ))}
            {live && <span className="text-ember">{t.projects.live}</span>}
        </div>
    )
}
