import { lazy, Suspense, useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { Route, Routes, useLocation } from 'react-router'
import { I18nProvider, type Locale } from '@/shared/i18n'
import { ORIGIN, PAGES, localeFromPath } from '@/shared/config/seo'
import { Navbar } from '@/widgets/navbar'
import { Footer } from '@/widgets/footer'
import { HomePage } from '@/pages/home'

/**
 * Панель управления грузится отдельным чанком и только по своему адресу.
 *
 * Портфолио — маркетинговая страница: её бандл не должен таскать с собой
 * админку, которую видит один человек. `lazy` здесь не преждевременная
 * оптимизация, а единственная причина, по которой роутер вообще уместен.
 */
const AdminPage = lazy(() =>
    import('@/pages/admin').then((module) => ({ default: module.AdminPage })),
)

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
    document.head.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * При первой загрузке head уже вписан пререндером; здесь он догоняет
 * переключение языка без перезагрузки.
 */
function useDocumentHead(locale: Locale) {
    useEffect(() => {
        const page = PAGES[locale]
        const url = ORIGIN + page.path
        document.documentElement.lang = locale
        document.title = page.title
        setMeta('meta[name="description"]', 'content', page.description)
        setMeta('link[rel="canonical"]', 'href', url)
        setMeta('meta[property="og:url"]', 'content', url)
        setMeta('meta[property="og:title"]', 'content', page.title)
        setMeta('meta[property="og:description"]', 'content', page.description)
        setMeta('meta[property="og:locale"]', 'content', page.ogLocale)
    }, [locale])
}

/**
 * Всё, что не `/admin`, — портфолио; `/en/…` — его английская версия.
 *
 * Один маршрут на оба языка, чтобы смена языка не пересоздавала страницу
 * и не проигрывала анимации появления заново. Неизвестный путь тоже
 * показывает портфолио, но сервер отвечает на него статусом 404.
 */
function Portfolio() {
    const locale = localeFromPath(useLocation().pathname)
    useDocumentHead(locale)

    return (
        <I18nProvider locale={locale}>
            <MotionConfig reducedMotion="user">
                <div className="grain relative min-h-svh">
                    <Navbar />
                    <HomePage />
                    <Footer />
                </div>
            </MotionConfig>
        </I18nProvider>
    )
}

/** Роутер снаружи: в браузере `BrowserRouter` (main.tsx), при пререндере `StaticRouter` */
export function App() {
    return (
        <Routes>
            <Route
                path="/admin/*"
                element={
                    <Suspense fallback={<div className="min-h-svh bg-ink" />}>
                        <AdminPage />
                    </Suspense>
                }
            />
            <Route path="*" element={<Portfolio />} />
        </Routes>
    )
}
