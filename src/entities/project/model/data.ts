import type { Project } from './types'

export const PROJECTS: Project[] = [
    {
        id: 'otascribe',
        title: 'OtaScribe',
        url: 'http://app.otascribe.ru',
        image: '/projects/otascribe.png',
        description: {
            ru: 'Сервис транскрибации аудио и видео: загрузил запись — получил текст с таймкодами.',
            en: 'An audio & video transcription service: upload a recording, get text with timecodes.',
        },
        tags: ['AI', 'Transcription', 'Audio'],
    },
    {
        id: 'poopseek',
        title: 'PoopSeek',
        url: 'https://github.com/Aver005/poopseek',
        image: '/projects/poopseek.png',
        description: {
            ru: 'Терминальный ИИ-агент на TypeScript и Bun: автономный agent-loop, 31+ инструмент, восемь LLM-провайдеров, протоколы MCP и ACP, семантический поиск по кодовой базе.',
            en: 'A terminal AI agent in TypeScript and Bun: an autonomous agent loop, 31+ tools, eight LLM providers, MCP and ACP protocols, and semantic codebase search.',
        },
        tags: ['AI', 'CLI', 'Bun'],
    },
    {
        id: 'warcube',
        title: 'WarCube',
        url: 'https://github.com/Aver005/warcube-web',
        image: '/projects/warcube.png',
        description: {
            ru: '2D тактический шутер на выживание: кубический боец против волн врагов в разрушаемом окружении. Phaser 3, React и процедурная генерация уровней.',
            en: 'A 2D tactical survival shooter: a cube warrior against waves of enemies in destructible arenas. Phaser 3, React and procedural level generation.',
        },
        tags: ['Game', 'Phaser', 'React'],
    },
    {
        id: 'pocacall',
        title: 'Pocacall',
        url: 'https://pocacall.kiviuly.ru',
        image: '/projects/pocacall.png',
        description: {
            ru: 'Платформа для видеозвонков без регистрации: зашёл по ссылке — и уже в комнате. Отзывчивый интерфейс, WebRTC под капотом.',
            en: 'A video-call platform with zero sign-up: open the link and you are in the room. Responsive UI, WebRTC under the hood.',
        },
        tags: ['WebRTC', 'React', 'UI/UX'],
    },
    {
        id: 'order-maushi',
        title: 'Order Maushi',
        url: 'https://order.maushi.ru',
        image: '/projects/order-maushi.png',
        description: {
            ru: 'Минималистичный анимированный сайт бронирования автоматизированных звукозаписывающих студий — от выбора слота до оплаты.',
            en: 'A minimalist animated booking site for automated recording studios — from picking a slot to payment.',
        },
        tags: ['Booking', 'Animation', 'Minimalism'],
    },
]
