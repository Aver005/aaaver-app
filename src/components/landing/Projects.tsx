import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { PROJECTS } from '@/data/portfolio'
import { ExternalLink } from 'lucide-react'

export function Projects() {
  return (
    <section id="projects" className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Мои Проекты</h2>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          {PROJECTS.map((project, index) => (
            <Reveal key={project.title} delay={index * 100}>
              <GlassCard hoverEffect className="h-full flex flex-col justify-between group cursor-pointer" onClick={() => window.open(project.url, '_blank')}>
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {project.title}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                  </div>
                  <p className="mb-6 text-white/70 leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
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
