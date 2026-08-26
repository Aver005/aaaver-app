import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { I18nProvider } from '@/shared/i18n'
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

/**
 * Всё, что не `/admin`, — портфолио.
 *
 * Звёздочка, а не только `/`: сервер отдаёт `index.html` на любой путь без
 * расширения (SPA-фолбэк), и до появления роутера такой путь показывал
 * портфолио. Так и оставляем — иначе чужая ссылка на несуществующий раздел
 * начала бы отдавать пустой экран вместо главной.
 */
function Portfolio() {
    return (
        <I18nProvider>
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

export function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    )
}
