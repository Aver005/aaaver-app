import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, type Dict, type L10n, type Locale } from './dict'

const STORAGE_KEY = 'aaaver-locale'

interface I18nValue {
    locale: Locale
    t: Dict
    /** Достаёт строку текущего языка из двуязычного значения */
    lx: (value: L10n) => string
    toggleLocale: () => void
}

const I18nContext = createContext<I18nValue | null>(null)

function detectLocale(): Locale {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved === 'ru' || saved === 'en') return saved
    } catch {
        /* приватный режим — едем дальше */
    }
    const lang = navigator.language?.toLowerCase() ?? ''
    return /^(ru|uk|be|kk)/.test(lang) ? 'ru' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>(detectLocale)

    const toggleLocale = useCallback(() => {
        setLocale((prev) => {
            const next: Locale = prev === 'ru' ? 'en' : 'ru'
            try {
                localStorage.setItem(STORAGE_KEY, next)
            } catch {
                /* ок */
            }
            document.documentElement.lang = next
            return next
        })
    }, [])

    const value = useMemo<I18nValue>(
        () => ({
            locale,
            t: dictionaries[locale],
            lx: (v) => v[locale],
            toggleLocale,
        }),
        [locale, toggleLocale],
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
    return ctx
}
