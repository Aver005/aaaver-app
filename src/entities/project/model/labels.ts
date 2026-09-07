import type { Locale } from '@/shared/i18n'
import type { ProjectKind, ProjectStatus } from './types'

/** Подписи видов и статусов: новый вид без перевода — ошибка компиляции */
export const KIND_LABELS: Record<Locale, Record<ProjectKind, string>> = {
    ru: { product: 'продукт', tool: 'инструмент', game: 'игра' },
    en: { product: 'product', tool: 'tool', game: 'game' },
}

export const STATUS_LABELS: Record<Locale, Record<ProjectStatus, string>> = {
    ru: { active: 'в работе', paused: 'на паузе', archived: 'архив' },
    en: { active: 'active', paused: 'paused', archived: 'archived' },
}
