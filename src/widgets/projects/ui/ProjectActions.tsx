import { ArrowUpRight } from 'lucide-react'
import { projectActions, type Project } from '@/entities/project'
import { DemoLink } from '@/features/demo-window'
import { useI18n } from '@/shared/i18n'
import { cn } from '@/shared/lib/cn'

interface ProjectActionsProps {
    project: Project
    liveSites: ReadonlySet<string>
    className?: string
}

const linkClass =
    'inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:text-ember'

/** Ссылки проекта по важности: демка внутри сайта, сайт, репозиторий */
export function ProjectActions({ project, liveSites, className }: ProjectActionsProps) {
    const { t } = useI18n()
    const actions = projectActions(project, liveSites)
    if (actions.length === 0) return null

    return (
        <div className={cn('flex flex-wrap gap-x-6 gap-y-2', className)}>
            {actions.map((action) =>
                action.kind === 'demo' ? (
                    <DemoLink key="demo" slug={action.slug} title={project.title} className={cn(linkClass, 'text-ember')}>
                        {t.projects.openDemo}
                        <ArrowUpRight size={13} />
                    </DemoLink>
                ) : (
                    <a
                        key={action.kind}
                        href={action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                    >
                        {action.kind === 'site' ? t.projects.visitSite : t.projects.visitRepo}
                        <ArrowUpRight size={13} />
                    </a>
                ),
            )}
        </div>
    )
}
