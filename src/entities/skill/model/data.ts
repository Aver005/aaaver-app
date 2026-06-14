import type { L10n } from '@/shared/i18n'

export interface SkillGroup {
    id: string
    name: L10n
    items: string[]
}

export const SKILL_GROUPS: SkillGroup[] = [
    {
        id: 'frontend',
        name: { ru: 'Фронтенд', en: 'Frontend' },
        items: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Motion', 'TanStack', 'Zustand'],
    },
    {
        id: 'backend',
        name: { ru: 'Бэкенд', en: 'Backend' },
        items: ['Bun', 'Node.js', 'Elysia', 'Python', 'Flask', 'FastAPI', 'WebSocket'],
    },
    {
        id: 'data',
        name: { ru: 'Данные', en: 'Data' },
        items: ['PostgreSQL', 'SQLite', 'Drizzle ORM', 'Elasticsearch', 'Zod'],
    },
    {
        id: 'tools',
        name: { ru: 'Инструменты', en: 'Tools' },
        items: ['Docker', 'Git', 'Linux', 'Figma', 'CI/CD'],
    },
    {
        id: 'gamedev',
        name: { ru: 'Геймдев', en: 'Game dev' },
        items: ['Phaser', 'Unity', 'C#', 'GameMaker', 'PyGame'],
    },
]

/** Плоский список для бегущей строки */
export const SKILL_MARQUEE = SKILL_GROUPS.flatMap((g) => g.items)
