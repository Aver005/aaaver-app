import { Box } from 'lucide-react'
import { TechColors, TechIcons } from './TechIcons'
import { Reveal } from '@/components/ui/Reveal'
import { TECH_STACK } from '@/data/portfolio'
import { cn } from '@/lib/utils'

export function Stack()
{
    const marqueeStack = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK]

    return (
        <section className="py-40 px-4 relative overflow-hidden border-y border-white/5 bg-white/5 backdrop-blur-sm">
            {/* Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full overflow-hidden">
                <Reveal>
                    <h2 className="mb-16 text-center text-4xl font-bold text-white tracking-tight">
                        Мой <span className="text-indigo-400">Стек</span>
                    </h2>
                </Reveal>

                <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex animate-marquee gap-8 py-4 whitespace-nowrap">
                        {marqueeStack.map((tech, i) =>
                        {
                            const Icon = TechIcons[tech] ?? Box
                            const colorClass = TechColors[tech] || 'text-white/80'

                            return (
                                <div
                                    key={`${tech}-${i}`}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md transition-colors hover:bg-white/10 hover:border-indigo-500/30"
                                >
                                    <Icon className={cn("size-6", colorClass)} />
                                    <span className="text-lg font-medium text-white/90">{tech}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
