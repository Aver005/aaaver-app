import type { Project, SiblingPair } from './types'

export const PROJECTS: Project[] = [
    {
        id: 'otascribe',
        title: 'OtaScribe',
        url: 'http://app.otascribe.ru',
        image: '/projects/otascribe.webp',
        description: {
            ru: 'Сервис транскрибации аудио и видео: загрузил запись — получил текст с таймкодами.',
            en: 'An audio & video transcription service: upload a recording, get text with timecodes.',
        },
        tags: ['AI', 'Transcription', 'Audio'],
    },
    {
        id: 'warcube',
        title: 'WarCube',
        url: 'https://github.com/Aver005/warcube-web',
        image: '/projects/warcube.webp',
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
        image: '/projects/pocacall.webp',
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
        image: '/projects/order-maushi.webp',
        description: {
            ru: 'Минималистичный анимированный сайт бронирования автоматизированных звукозаписывающих студий — от выбора слота до оплаты.',
            en: 'A minimalist animated booking site for automated recording studios — from picking a slot to payment.',
        },
        tags: ['Booking', 'Animation', 'Minimalism'],
    },
]

export const SIBLINGS: SiblingPair = {
    brothers: [
        {
            id: 'poopseek',
            title: 'PoopSeek',
            url: 'https://github.com/Aver005/poopseek',
            image: '/projects/poopseek.webp',
            description: {
                ru: 'Терминальный ИИ-агент на TypeScript и Bun: автономный agent-loop, 31+ инструмент, восемь LLM-провайдеров, протоколы MCP и ACP, семантический поиск по кодовой базе.',
                en: 'A terminal AI agent in TypeScript and Bun: an autonomous agent loop, 31+ tools, eight LLM providers, MCP and ACP protocols, and semantic codebase search.',
            },
            tags: ['AI', 'CLI', 'Bun'],
        },
        {
            id: 'pooprusteek',
            title: 'PoopRusteek',
            url: 'https://github.com/Aver005/pooprusteek',
            image: '/projects/pooprusteek.webp',
            description: {
                ru: 'Перезапись PoopSeek на Rust с богатым TUI: Ratatui, Catppuccin-тема, потоковый вывод, PoW через WASM, MCP и ACP-сервер, PTY для интерактивных процессов.',
                en: 'A Rust rewrite of PoopSeek with a rich TUI: Ratatui, Catppuccin theme, streaming output, PoW via WASM, MCP and ACP server, PTY for interactive processes.',
            },
            tags: ['AI', 'CLI', 'Rust'],
        },
    ],
}
