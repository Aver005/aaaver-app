import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { TECH_STACK } from '@/data/portfolio'

export function Stack() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
       {/* Decor */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="mx-auto max-w-4xl relative z-10">
        <Reveal>
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Стек Технологий</h2>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-wrap justify-center gap-4">
            {TECH_STACK.map((tech, i) => (
              <GlassCard key={tech} className="py-3 px-6 hover:bg-white/10 transition-colors cursor-default">
                <span className="text-lg font-medium text-white/90">{tech}</span>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
