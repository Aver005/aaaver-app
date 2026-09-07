import { Hero } from '@/widgets/hero'
import { Projects } from '@/widgets/projects'
import { Experience } from '@/widgets/experience'
import { OpenSource } from '@/widgets/open-source'
import { Contact } from '@/widgets/contact'
import { DemoWindow } from '@/features/demo-window'

export function HomePage() {
    return (
        <main>
            <Hero />
            <div className="flex flex-col gap-28 pt-28 sm:gap-40 sm:pt-40">
                <Projects />
                <Experience />
                <OpenSource />
                <Contact />
            </div>
            <DemoWindow />
        </main>
    )
}
