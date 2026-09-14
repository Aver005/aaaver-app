import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { dictionaries, type Locale } from '@/shared/i18n'
import { LOCALES, ORIGIN, PAGES } from '@/shared/config/seo'
import { SITE } from '@/shared/config/site'
import { PROJECTS, SIBLINGS } from '@/entities/project'
import { JOBS } from '@/entities/experience'
import { SKILL_GROUPS } from '@/entities/skill'

/** Вход для пререндера (`scripts/prerender.ts`): те же провайдеры, что в main.tsx */
export function render(pathname: string): string {
    return renderToString(
        <StrictMode>
            <StaticRouter location={pathname}>
                <App />
            </StaticRouter>
        </StrictMode>,
    )
}

export { LOCALES, ORIGIN, PAGES, SITE }

/** Контент для JSON-LD и llms.txt — ровно то, что видно на странице */
export function content(locale: Locale) {
    const t = dictionaries[locale]
    return {
        name: `${t.hero.firstName} ${t.hero.lastName}`,
        kicker: t.hero.kicker,
        lede: t.hero.lede,
        about: t.about.body,
        jobs: JOBS.map((job) => ({
            company: job.company[locale],
            companyUrl: job.companyUrl,
            role: job.role[locale],
            from: job.from,
            to: job.to,
        })),
        projects: [...PROJECTS, ...SIBLINGS.brothers].map((project) => ({
            id: project.id,
            title: project.title,
            url: project.url,
            description: project.description[locale],
        })),
        skills: SKILL_GROUPS.flatMap((group) => group.items),
    }
}
