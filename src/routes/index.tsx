import { createFileRoute } from '@tanstack/react-router'
import { Hero } from '@/components/landing/Hero'
import { Projects } from '@/components/landing/Projects'
import { Stack } from '@/components/landing/Stack'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-slate-950 selection:bg-indigo-500/30">
      <Hero />
      <Projects />
      <Stack />
      <FAQ />
      <Footer />
    </div>
  )
}
