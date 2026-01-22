import
{
    HeadContent,
    Scripts,
    createRootRouteWithContext,
} from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import css from '#/styles/global.css?url';

import { getLocale } from '@/paraglide/runtime'

interface MyRouterContext
{
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    beforeLoad: () =>
    {
        if (typeof document === 'undefined') return;
        document.documentElement.setAttribute('lang', getLocale())
    },

    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'Артемий | aaaver.ru',
            },
            {
                name: 'author',
                content: 'Артемий',
            },
            {
                name: 'robots',
                content: 'index, follow',
            },
            {
                property: 'og:site_name',
                content: 'aaaver.ru',
            },
            {
                property: 'og:locale',
                content: getLocale(),
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: css,
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.ico',
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/logo192.png',
            },
            {
                rel: 'canonical',
                href: 'https://aaaver.ru',
            },
        ],
    }),

    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode })
{
    return (
        <html lang={getLocale()}>
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    )
}
