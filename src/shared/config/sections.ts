/**
 * Реестр разделов главной: порядок, id якорей и номера. Единственный источник
 * для навигации, рейки, оглавления и заголовков секций.
 */
export const SECTIONS = [
    { id: 'projects', index: '01' },
    { id: 'experience', index: '02' },
    { id: 'opensource', index: '03' },
    { id: 'contact', index: '04' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

/** Id секций для наблюдения активной, включая шапку страницы */
export const SECTION_IDS: readonly string[] = ['top', ...SECTIONS.map((s) => s.id)]

export function sectionIndex(id: SectionId): string {
    return SECTIONS.find((s) => s.id === id)?.index ?? ''
}
