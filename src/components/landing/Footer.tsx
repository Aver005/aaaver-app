import { useState } from 'react'
import { CheckCircle2, Github, Loader2, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import * as m from '@/paraglide/messages'

export function Footer()
{
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) =>
    {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSuccess(true)

        // Reset success state after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000)
    }

    return (
        <footer id="contact" className="py-40 px-4 pb-20 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-125 w-200 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

            <div className="mx-auto max-w-5xl relative z-10">
                <Reveal>
                    <div className="grid gap-16 md:grid-cols-2 items-center">
                        <div className="md:pr-8">
                            <h2 className="mb-6 text-4xl font-bold text-white tracking-tight">
                                {m.footer_title_1()} <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
                                    {m.footer_title_2()}
                                </span>
                            </h2>
                            <p className="mb-8 text-lg text-slate-300 leading-relaxed">
                                {m.footer_subtitle()}
                            </p>

                            <div className="space-y-6">
                                <a href="https://github.com/aver005" target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-indigo-500/10">
                                    <div className="rounded-lg bg-white/10 p-2 text-white group-hover:scale-110 transition-transform">
                                        <Github className="size-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">GitHub</div>
                                        <div className="text-sm text-white/50">{m.footer_github_desc()}</div>
                                    </div>
                                </a>

                                <a href="https://t.me/aver005" target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-cyan-500/10">
                                    <div className="rounded-lg bg-white/10 p-2 text-white group-hover:scale-110 transition-transform">
                                        <Send className="size-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Telegram</div>
                                        <div className="text-sm text-white/50">{m.footer_telegram_desc()}</div>
                                    </div>
                                </a>

                                <a href="mailto:aver.tema.005@ya.ru" className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-pink-500/10">
                                    <div className="rounded-lg bg-white/10 p-2 text-white group-hover:scale-110 transition-transform">
                                        <Mail className="size-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Email</div>
                                        <div className="text-sm text-white/50">{m.footer_email_desc()}</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <GlassCard className="relative overflow-hidden border-white/10 bg-linear-to-br from-slate-900/90 to-slate-800/90 p-8 shadow-2xl shadow-indigo-500/20">
                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <div className="group relative">
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-transparent focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder={m.footer_form_name_placeholder()}
                                    />
                                    <label
                                        htmlFor="name"
                                        className="absolute left-4 top-3 text-sm text-white/50 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-xs peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-400"
                                    >
                                        {m.footer_form_name_label()}
                                    </label>
                                </div>

                                <div className="group relative">
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-transparent focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder={m.footer_form_email_placeholder()}
                                    />
                                    <label
                                        htmlFor="email"
                                        className="absolute left-4 top-3 text-sm text-white/50 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-xs peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-400"
                                    >
                                        {m.footer_form_email_label()}
                                    </label>
                                </div>

                                <div className="group relative">
                                    <textarea
                                        id="message"
                                        rows={4}
                                        required
                                        className="peer w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-transparent focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                        placeholder={m.footer_form_message_placeholder()}
                                    />
                                    <label
                                        htmlFor="message"
                                        className="absolute left-4 top-3 text-sm text-white/50 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-slate-900 peer-focus:px-1 peer-focus:text-xs peer-focus:text-indigo-400 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-slate-900 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-indigo-400"
                                    >
                                        {m.footer_form_message_label()}
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isSuccess}
                                    className={cn(
                                        "w-full h-12 text-lg font-medium transition-all duration-300",
                                        isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isSuccess ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            {m.footer_btn_success()}
                                        </span>
                                    ) : (
                                        m.footer_btn_submit()
                                    )}
                                </Button>
                            </form>
                        </GlassCard>
                    </div>
                </Reveal>

                <div className="mt-24 border-t border-white/5 pt-8 text-center text-sm text-white/30">
                    <p>© {new Date().getFullYear()} {m.footer_copyright_text()}</p>
                </div>
            </div>
        </footer>
    )
}
