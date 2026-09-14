import type { Locale } from '@/shared/i18n'
import { SITE } from './site'

export const ORIGIN = `https://${SITE.domain}`

interface PageMeta {
    path: string
    title: string
    description: string
    ogLocale: string
}

/**
 * Язык живёт в адресе: `/` — русская версия, `/en/` — английская.
 * Отсюда берут head и пререндер при сборке, и клиент при переключении языка.
 */
export const PAGES: Record<Locale, PageMeta> = {
    ru: {
        path: '/',
        title: 'Артемий Аверьянов — Front-end разработчик и тимлид',
        description:
            'Артемий Аверьянов — front-end разработчик и тимлид. React, TypeScript, Bun. Веду фронтенд-команду в продуктовой разработке, делаю быстрые и аккуратные интерфейсы.',
        ogLocale: 'ru_RU',
    },
    en: {
        path: '/en/',
        title: 'Artemiy Averyanov — Front-end Developer & Team Lead',
        description:
            'Artemiy Averyanov — front-end developer and team lead. React, TypeScript, Bun. I lead a front-end team in product development and build fast, precise interfaces.',
        ogLocale: 'en_US',
    },
}

export const LOCALES = Object.keys(PAGES) as Locale[]

export function localeFromPath(pathname: string): Locale {
    return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ru'
}
