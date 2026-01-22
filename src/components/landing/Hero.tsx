import { ArrowDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function Hero()
{
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Background blobs - more complex */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-600/20 blur-[128px]" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-600/20 blur-[128px] delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-125 w-125 rounded-full bg-violet-600/10 blur-[100px]" />

            <div className="relative z-10 max-w-4xl text-center">
                <Reveal>
                    <div className="relative inline-block">
                        <h1 className="relative mb-12 text-5xl font-bold tracking-tight text-white sm:text-7xl">
                            Артемий <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-violet-400 to-cyan-400 animate-gradient-x">Аверьянов</span>
                        </h1>
                    </div>
                </Reveal>

                <Reveal delay={200}>
                    <p className="mb-8 text-xl text-slate-300 sm:text-2xl font-light tracking-wide">
                        Front-End Developer. Создаю <span className="text-indigo-400 font-medium">красивые</span> и <span className="text-cyan-400 font-medium">функциональные</span> интерфейсы.
                    </p>
                </Reveal>

                <Reveal delay={400}>
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Button
                            className="relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
                            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="relative z-10">Смотреть проекты</span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
                        </Button>
                        <Button variant="soft" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                            Связаться со мной
                        </Button>
                    </div>
                </Reveal>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute top-20 left-10 hidden lg:block animate-bounce duration-3000">
                <div className="h-12 w-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <ArrowDownIcon className='opacity-40 m-3' />
                </div>
            </div>
            <div className="absolute bottom-20 right-10 hidden lg:block animate-bounce duration-4000 delay-700">
                <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                    <ArrowDownIcon className='opacity-40 m-5' />
                </div>
            </div>
        </section>
    )
}
