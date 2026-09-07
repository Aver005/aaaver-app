import { STATUS_LABELS, type Project } from '@/entities/project'
import { useI18n } from '@/shared/i18n'
import { ProjectActions } from './ProjectActions'

interface ToolRowProps {
    project: Project
    liveSites: ReadonlySet<string>
}

/** Строка компактного ряда: имя, суть, стек, ссылки */
export function ToolRow({ project, liveSites }: ToolRowProps) {
    const { lx, locale } = useI18n()

    return (
        <li className="grid grid-cols-1 gap-2 border-b hairline py-4 sm:grid-cols-12 sm:items-baseline sm:gap-6">
            <div className="flex items-baseline gap-3 sm:col-span-3">
                <h4 className="font-mono text-sm text-paper">{project.title}</h4>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-faint">
                    {STATUS_LABELS[locale][project.status]}
                </span>
            </div>
            <p className="text-sm leading-relaxed text-paper-dim sm:col-span-6">{lx(project.summary)}</p>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 sm:col-span-3">
                <span className="font-mono text-[11px] text-paper-faint">{project.stack.slice(0, 3).join(' · ')}</span>
                <ProjectActions project={project} liveSites={liveSites} />
            </div>
        </li>
    )
}
