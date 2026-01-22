import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-[128px]" />

      <div className="relative z-10 max-w-4xl text-center">
        <Reveal>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Артемий <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Аверьянов</span>
          </h1>
        </Reveal>
        
        <Reveal delay={200}>
          <p className="mb-8 text-xl text-white/70 sm:text-2xl">
            Front-End Developer. Создаю красивые и функциональные интерфейсы.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
              Смотреть проекты
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Связаться со мной
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
