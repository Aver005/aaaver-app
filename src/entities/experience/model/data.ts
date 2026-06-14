import type { L10n } from '@/shared/i18n'

export interface Job {
    id: string
    from: string
    /** null — по настоящее время */
    to: string | null
    company: L10n
    companyUrl?: string
    role: L10n
    description: L10n
}

export const JOBS: Job[] = [
    {
        id: 'rta',
        from: '2024',
        to: null,
        company: { ru: 'РТА Технологии', en: 'RTA Technologies' },
        companyUrl: 'https://rtatex.ru',
        role: { ru: 'Ведущий фронтенд-разработчик, тимлид', en: 'Lead front-end developer, team lead' },
        description: {
            ru: 'Веду фронтенд-направление в продуктовой команде: интерфейсы продуктов, в том числе сервиса транскрибации OtaScribe. Архитектура клиентской части, команда, код-ревью.',
            en: 'Leading front-end work in the product team: product interfaces, including the OtaScribe transcription service. Client-side architecture, team, code review.',
        },
    },
    {
        id: 'foxford',
        from: '2023',
        to: '2024',
        company: { ru: 'Фоксфорд', en: 'FoxFord' },
        role: { ru: 'Преподаватель Python', en: 'Python instructor' },
        description: {
            ru: 'Вёл курсы Python на одной из крупнейших образовательных платформ России.',
            en: 'Taught Python courses at one of the largest e-learning platforms in Russia.',
        },
    },
    {
        id: 'maxima',
        from: '2022',
        to: '2023',
        company: { ru: 'Maxima', en: 'Maxima' },
        role: { ru: 'Преподаватель JavaScript и Python', en: 'JavaScript & Python instructor' },
        description: {
            ru: 'Год преподавания в онлайн-школе: от основ языка до первых проектов учеников.',
            en: 'A year of teaching at an online school: from language basics to students’ first projects.',
        },
    },
    {
        id: 'kodland',
        from: '2021',
        to: '2023',
        company: { ru: 'Kodland', en: 'Kodland' },
        role: { ru: 'Преподаватель Python и Unity', en: 'Python & Unity instructor' },
        description: {
            ru: 'Два года в международной онлайн-школе программирования: учил школьников делать игры и ботов.',
            en: 'Two years at an international programming school: taught kids to build games and bots.',
        },
    },
]
