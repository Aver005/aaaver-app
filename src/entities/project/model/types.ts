import type { L10n } from '@/shared/i18n'

export interface Project {
    id: string
    title: string
    url: string
    image: string
    description: L10n
    tags: string[]
}
