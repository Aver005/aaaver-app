import { Hero } from '@/widgets/hero'
import { StackMarquee } from '@/widgets/stack'
import { About } from '@/widgets/about'
import { Experience } from '@/widgets/experience'
import { Projects } from '@/widgets/projects'
import { OpenSource } from '@/widgets/open-source'
import { Stack } from '@/widgets/stack'
import { Contact } from '@/widgets/contact'

export function HomePage() {
    return (
        <main>
            <Hero />
            <StackMarquee />
            <div className="flex flex-col gap-28 pt-28 sm:gap-44 sm:pt-44">
                <About />
                <Experience />
                <Projects />
                <OpenSource />
                <Stack />
                <Contact />
            </div>
        </main>
    )
}
