import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { isPlainClick } from '@/shared/lib/plainClick'
import { canOpenInWindow, demoUrl, demoWindow } from '../model/store'

interface DemoLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
    slug: string
    title: string
    children: ReactNode
}

/**
 * Ссылка на демку: без JS и на тач-устройствах — обычная вкладка,
 * с курсором обычный клик открывает окно внутри сайта. Ctrl/Cmd-клик
 * и средняя кнопка ведут себя как у любой ссылки.
 */
export function DemoLink({ slug, title, children, ...rest }: DemoLinkProps) {
    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!isPlainClick(event) || !canOpenInWindow()) return
        event.preventDefault()
        demoWindow.open({ slug, title })
    }

    return (
        <a href={demoUrl(slug)} target="_blank" rel="noopener noreferrer" onClick={onClick} {...rest}>
            {children}
        </a>
    )
}
