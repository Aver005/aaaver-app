import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { cn, getLocalized } from '@/lib/utils'
import * as m from '@/paraglide/messages'
import { getLocale } from '@/paraglide/runtime'

interface FAQProps
{
    items: Array<{ question: Record<string, string>, answer: Record<string, string> }>
}

export function FAQ({ items }: FAQProps)
{
    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const locale = getLocale()

    return (
        <section className="py-40 px-4">
            <div className="mx-auto max-w-3xl">
                <Reveal>
                    <h2 className="mb-12 text-center text-3xl font-bold text-white">{m.faq_title()}</h2>
                </Reveal>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <Reveal key={index} delay={index * 100}>
                            <GlassCard
                                className="cursor-pointer transition-all hover:bg-white/10"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-white">{getLocalized(item.question, locale)}</h3>
                                    <ChevronDown
                                        className={cn(
                                            "h-5 w-5 text-white/50 transition-transform duration-300",
                                            openIndex === index && "rotate-180"
                                        )}
                                    />
                                </div>
                                <div
                                    className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        openIndex === index ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                                    )}
                                >
                                    <div className="overflow-hidden text-white/70">
                                        {getLocalized(item.answer, locale)}
                                    </div>
                                </div>
                            </GlassCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
