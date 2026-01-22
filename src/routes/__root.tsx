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
        ],
        links: [
            {
                rel: 'stylesheet',
                href: css,
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
