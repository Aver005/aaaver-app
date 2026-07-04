import type { L10n } from '@/shared/i18n'

export interface Project {
    id: string
    title: string
    url?: string
    image: string
    /** Все изображения галереи; первый элемент — акцентное изображение по умолчанию */
    gallery?: string[]
    description: L10n
    tags: string[]
}

export interface SiblingPair {
    brothers: [Project, Project]
}
