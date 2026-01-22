import * as m from '@/paraglide/messages'

export const PROJECTS = [
    {
        title: 'Pocacall',
        description: m.project_pocacall_desc(),
        url: 'https://pocacall.kiviuly.ru',
        tags: ['Video', 'WebRTC', 'UI/UX'],
        image: '/projects/pocacall.png'
    },
    {
        title: 'Order Maushi',
        description: m.project_order_maushi_desc(),
        url: 'https://order.maushi.ru',
        tags: ['Booking', 'Animation', 'Minimalism'],
        image: '/projects/order-maushi.png'
    },
    {
        title: 'RtaTex',
        description: m.project_rtatex_desc(),
        url: 'https://rtatex.ru/',
        tags: ['Corporate', 'Presentation'],
        image: '/projects/rtatex.png'
    },
    {
        title: 'OtaScribe',
        description: m.project_otascribe_desc(),
        url: 'http://app.otascribe.ru',
        tags: ['AI', 'Transcription', 'Audio'],
        image: '/projects/otascribe.png'
    }
] as const

export const TECH_STACK = [
    'React',
    'TypeScript',
    'Vite',
    'Bun',
    'DaisyUI',
    'ShadCN',
    'TanStack',
    'Elysia',
    'Zustand',
    'Framer Motion',
    'Drizzle',
    'Lucide Icons',
    'Zod',
    'Tailwind',
    'ESLint'
] as const

export const FAQ_ITEMS = [
    {
        question: m.faq_stack_q(),
        answer: m.faq_stack_a()
    },
    {
        question: m.faq_freelance_q(),
        answer: m.faq_freelance_a()
    },
    {
        question: m.faq_contact_q(),
        answer: m.faq_contact_a()
    }
] as const
