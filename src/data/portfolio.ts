export const PROJECTS = [
    {
        title: 'Pocacall',
        description: 'Удобная платформа для видеозвонков без регистраций с приятным и отзывчивым интерфейсом.',
        url: 'https://pocacall.kiviuly.ru',
        tags: ['Video', 'WebRTC', 'UI/UX'],
        image: '/projects/pocacall.png'
    },
    {
        title: 'Order Maushi',
        description: 'Минималистичный анимированный сайт для бронирования автоматизированных звукостудий.',
        url: 'https://order.maushi.ru',
        tags: ['Booking', 'Animation', 'Minimalism'],
        image: '/projects/order-maushi.png'
    },
    {
        title: 'RtaTex',
        description: 'Главный сайт компании РТА Технологии. Презентация услуг и команды.',
        url: 'https://rtatex.ru/',
        tags: ['Corporate', 'Presentation'],
        image: '/projects/rtatex.png'
    },
    {
        title: 'OtaScribe',
        description: 'Продвинутое решение для транскрибации аудио и видео информации.',
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
        question: 'Какой стек вы используете?',
        answer: 'В основном я работаю с React, TypeScript и Bun, используя современные инструменты вроде Vite и TanStack.'
    },
    {
        question: 'Берете ли вы фриланс заказы?',
        answer: 'Да, я открыт для интересных предложений. Свяжитесь со мной через форму ниже.'
    },
    {
        question: 'Как с вами связаться?',
        answer: 'Можно написать в Telegram или на почту. Контакты указаны в футере.'
    }
] as const
