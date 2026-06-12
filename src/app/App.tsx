import { MotionConfig } from 'motion/react'
import { I18nProvider } from '@/shared/i18n'
import { Navbar } from '@/widgets/navbar'
import { Footer } from '@/widgets/footer'
import { HomePage } from '@/pages/home'

export function App() {
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
