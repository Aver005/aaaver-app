import { SKILL_MARQUEE } from '@/entities/skill'
import { Marquee } from '@/shared/ui'

/** Бегущая строка-разделитель между hero и контентом */
export function StackMarquee() {
    return (
        <div className="border-y hairline">
            <Marquee className="py-4">
                {SKILL_MARQUEE.map((item) => (
                    <span
                        key={item}
                        className="flex items-center font-mono text-xs uppercase tracking-[0.24em] text-paper-faint"
                    >
                        <span className="px-6">{item}</span>
                        <span aria-hidden="true" className="text-ember/70">
                            ✦
                        </span>
                    </span>
                ))}
            </Marquee>
        </div>
    )
}
