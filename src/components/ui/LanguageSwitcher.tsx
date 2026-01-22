import { getLocale, locales, localizeUrl } from '@/paraglide/runtime'

export function LanguageSwitcher()
{
    const currentLocale = getLocale()

    const switchLanguage = (newLocale: string) =>
    {
        if (typeof window === 'undefined') return
        const newUrl = localizeUrl(window.location.href, { locale: newLocale as any })
        window.location.href = newUrl.href
    }

    return (
        <div className="flex gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => switchLanguage(locale)}
                    className={`text-sm font-medium transition-colors ${currentLocale === locale
                            ? 'text-indigo-400'
                            : 'text-white/60 hover:text-white'
                        }`}
                >
                    {locale.toUpperCase()}
                </button>
            ))}
        </div>
    )
}
