import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { dictionaries, type Dict, type L10n, type Locale } from './dict'

interface I18nValue {
    locale: Locale
    t: Dict
    /** Достаёт строку текущего языка из двуязычного значения */
    lx: (value: L10n) => string
}

const I18nContext = createContext<I18nValue | null>(null)

/**
 * Язык приходит сверху, из адреса страницы, — не из localStorage и не из
 * `navigator.language`. Иначе пререндер (который браузера не видит) и первый
 * рендер в браузере разойдутся, а поисковик получит одну страницу на два языка.
 */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
    const value = useMemo<I18nValue>(
        () => ({
            locale,
            t: dictionaries[locale],
            lx: (v) => v[locale],
        }),
        [locale],
    )

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
    const ctx = useContext(I18nContext)
    if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
    return ctx
}
