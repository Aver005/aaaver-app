import { contacts, faqs, techStack } from './schema'
import { db } from './index'

async function seed()
{
    console.log('Seeding...')

    // FAQs
    await db.insert(faqs).values([
        {
            question: {
                ru: "Какой стек вы используете?",
                en: "What stack do you use?"
            },
            answer: {
                ru: "В основном я работаю с React, TypeScript и Bun, используя современные инструменты вроде Vite и TanStack.",
                en: "I mainly work with React, TypeScript and Bun, using modern tools like Vite and TanStack."
            },
            order: 1
        },
        {
            question: {
                ru: "Берете ли вы фриланс заказы?",
                en: "Do you take freelance orders?"
            },
            answer: {
                ru: "Да, я открыт для интересных предложений. Свяжитесь со мной через форму ниже.",
                en: "Yes, I am open to interesting proposals. Contact me via the form below."
            },
            order: 2
        },
        {
            question: {
                ru: "Как с вами связаться?",
                en: "How to contact you?"
            },
            answer: {
                ru: "Можно написать в Telegram или на почту. Контакты указаны в футере.",
                en: "You can write to Telegram or email. Contacts are listed in the footer."
            },
            order: 3
        }
    ])

    // Stack
    const stack = [
        'React', 'TypeScript', 'Vite', 'Bun', 'DaisyUI', 'ShadCN',
        'TanStack', 'Elysia', 'Zustand', 'Framer Motion', 'Drizzle',
        'Lucide Icons', 'Zod', 'Tailwind', 'ESLint'
    ]

    await db.insert(techStack).values(
        stack.map((name, i) => ({
            name,
            order: i + 1,
            category: { ru: "Фронтенд", en: "Frontend" } // Placeholder category
        }))
    )

    // Contacts
    await db.insert(contacts).values([
        {
            type: 'github',
            value: 'GitHub',
            link: 'https://github.com/aver005',
            label: { ru: 'GitHub', en: 'GitHub' },
            description: { ru: 'Посмотрите мой код', en: 'Check out my code' },
            order: 1
        },
        {
            type: 'telegram',
            value: 'Telegram',
            link: 'https://t.me/aver005',
            label: { ru: 'Telegram', en: 'Telegram' },
            description: { ru: 'Быстрая связь', en: 'Fast contact' },
            order: 2
        },
        {
            type: 'email',
            value: 'Email',
            link: 'mailto:aver.tema.005@ya.ru',
            label: { ru: 'Email', en: 'Email' },
            description: { ru: 'Для официальных запросов', en: 'For official inquiries' },
            order: 3
        }
    ])

    console.log('Done!')
}

seed().catch(console.error)
