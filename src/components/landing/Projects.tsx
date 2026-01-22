import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { PROJECTS } from '@/data/portfolio'

const GRADIENTS = [
  'from-pink-500/20 to-rose-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-violet-500/20 to-purple-500/20',
]

export function Projects() {
  return (
    <section id="projects" className="py-24 px-4 relative">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-12 text-center text-4xl font-bold text-white tracking-tight">
            Мои <span className="text-indigo-400">Проекты</span>
          </h2>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.title} delay={index * 100}>
              <GlassCard 
                hoverEffect 
                className="h-full flex flex-col justify-between group cursor-pointer border-white/5 bg-slate-900/40" 
                onClick={() => window.open(project.url, '_blank')}
              >
                {/* Abstract Visual Placeholder */}
                <div className={`mb-6 h-48 w-full rounded-xl bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500`}>
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')] opacity-20" />
                   <div className="absolute bottom-4 right-4 rounded-full bg-white/10 p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <ArrowUpRight className="h-6 w-6 text-white" />
                   </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-white/30 group-hover:text-white transition-colors" />
                  </div>
                  <p className="mb-6 text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
