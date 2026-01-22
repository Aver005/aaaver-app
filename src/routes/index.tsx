import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/landing/Hero'
import { Projects } from '@/components/landing/Projects'
import { Stack } from '@/components/landing/Stack'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { getLandingData } from '@/lib/actions'

export const Route = createFileRoute('/')({
    component: LandingPage,
    loader: async () => {
        return await getLandingData()
    },
    head: () => ({
        meta: [
            {
                title: 'Артемий | Fullstack Разработчик | aaaver.ru',
            },
            {
                name: 'description',
                content: 'Портфолио Fullstack разработчика. Современный стек: React, TypeScript, Bun, Vite. Разработка быстрых и масштабируемых веб-приложений.',
            },
            {
                name: 'keywords',
                content: 'Артемий, aaaver, Fullstack разработчик, React, TypeScript, Bun, Vite, Tailwind CSS, веб-разработка, портфолио, фронтенд, бэкенд, Pocacall, Order Maushi, RtaTex',
            },
            {
                property: 'og:title',
                content: 'Артемий | Fullstack Разработчик | aaaver.ru',
            },
            {
                property: 'og:description',
                content: 'Портфолио Fullstack разработчика. Современный стек: React, TypeScript, Bun, Vite. Разработка быстрых и масштабируемых веб-приложений.',
            },
            {
                property: 'og:image',
                content: 'https://aaaver.ru/logo512.png',
            },
            {
                property: 'og:type',
                content: 'website',
            },
            {
                property: 'og:url',
                content: 'https://aaaver.ru',
            },
            {
                name: 'twitter:card',
                content: 'summary_large_image',
            },
            {
                name: 'twitter:title',
                content: 'Артемий | Fullstack Разработчик',
            },
            {
                name: 'twitter:description',
                content: 'Портфолио Fullstack разработчика. Современный стек: React, TypeScript, Bun, Vite.',
            },
            {
                name: 'twitter:image',
                content: 'https://aaaver.ru/logo512.png',
            },
        ],
        scripts: [
            {
                type: 'application/ld+json',
                children: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Person',
                    name: 'Артемий',
                    url: 'https://aaaver.ru',
                    image: 'https://aaaver.ru/logo512.png',
                    sameAs: ['https://github.com/aver005', 'https://t.me/aver005'],
                    jobTitle: 'Fullstack Developer',
                    description: 'Fullstack разработчик (React, TypeScript, Bun, Vite)',
                    email: 'aver.tema.005@ya.ru',
                }),
            },
        ],
    }),
})

function LandingPage()
{
    const { faqs, stack, contacts } = Route.useLoaderData()

    return (
        <div className="min-h-screen w-full bg-slate-950 selection:bg-indigo-500/30 relative">
            {/* Global Noise Overlay */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJYdWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] z-50" />

            <Hero />
            <Projects />
            <Stack items={stack} />
            <FAQ items={faqs} />
            <Footer contacts={contacts} />
        </div>
    )
}
