import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { FAQ_ITEMS } from '@/data/portfolio'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="mb-12 text-center text-3xl font-bold text-white">FAQ</h2>
        </Reveal>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <Reveal key={index} delay={index * 100}>
              <GlassCard 
                className="cursor-pointer transition-all hover:bg-white/10"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">{item.question}</h3>
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
                    {item.answer}
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
