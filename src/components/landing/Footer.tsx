import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { Reveal } from '@/components/ui/Reveal'
import { Github, Mail, Send } from 'lucide-react'

export function Footer()
{
    const handleSubmit = (e: React.FormEvent) =>
    {
        e.preventDefault()
        alert('Спасибо за сообщение! (Демо режим)')
    }

    return (
        <footer id="contact" className="py-24 px-4 pb-10">
            <div className="mx-auto max-w-4xl">
                <Reveal>
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold text-white">Контакты</h2>
                            <p className="mb-8 text-white/70">
                                Готов обсудить ваш проект или просто пообщаться.
                                Пишите в любое время!
                            </p>

                            <div className="space-y-4">
                                <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-indigo-400 transition-colors">
                                    <Github className="h-5 w-5" />
                                    <span>GitHub</span>
                                </a>
                                <a href="https://t.me" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/80 hover:text-indigo-400 transition-colors">
                                    <Send className="h-5 w-5" />
                                    <span>Telegram</span>
                                </a>
                                <a href="mailto:hello@example.com" className="flex items-center gap-3 text-white/80 hover:text-indigo-400 transition-colors">
                                    <Mail className="h-5 w-5" />
                                    <span>Email</span>
                                </a>
                            </div>
                        </div>

                        <GlassCard>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm text-white/70">Имя</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Иван Иванов"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-white/70">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="ivan@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm text-white/70">Сообщение</label>
                                    <textarea
                                        rows={4}
                                        required
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Привет, хочу обсудить проект..."
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Отправить
                                </Button>
                            </form>
                        </GlassCard>
                    </div>
                </Reveal>

                <div className="mt-20 text-center text-sm text-white/30">
                    © {new Date().getFullYear()} Artemiy Averyanov. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
