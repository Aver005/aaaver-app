import type { Project, ShowcaseEntry } from './types'

/**
 * Витрина: пластина — там, где есть живая демка или проверяемые факты.
 * Числа только структурные (не растут сами) или проверенные по репозиторию.
 * Порядок массива = порядок на странице.
 */

const craws: Project = {
    id: 'craws',
    title: 'craws',
    kind: 'tool',
    status: 'active',
    period: { from: '2026-07' },
    role: { ru: 'соло: движок, CLI, MCP-сервер', en: 'solo: engine, CLI, MCP server' },
    summary: {
        ru: 'Движок обработки изображений на Rust для разработчиков: конвейер операций над тайлами с кэшем по хэшу содержимого, linear-light f32. Управляется из CLI или ИИ-агентом по MCP — скриншот этой пластины обработан им же.',
        en: 'A Rust image-processing engine for developers: a pipeline of ops over tiles with a content-hash cache, linear-light f32. Driven from the CLI or by an AI agent over MCP — the screenshot on this plate was processed with it.',
    },
    stack: ['Rust', 'rayon', 'MCP', 'CLI'],
    facts: [
        { value: '34', label: { ru: 'инструмента в MCP-сервере', en: 'tools in the MCP server' } },
        { value: 'f32', label: { ru: 'linear-light, premultiplied', en: 'linear-light, premultiplied' } },
        { value: 'hash', label: { ru: 'кэш тайлов по содержимому', en: 'content-hash tile cache' } },
    ],
    links: { repo: 'https://github.com/Aver005/craws' },
    images: ['/projects/craws.webp'],
}

const pooprusteek: Project = {
    id: 'pooprusteek',
    title: 'PoopRusteek',
    kind: 'tool',
    status: 'active',
    period: { from: '2026-06' },
    role: { ru: 'соло', en: 'solo' },
    summary: {
        ru: 'Терминальный агент для кодинга на Rust: параллельные чаты, саб-агенты, GOAL-цикл, MCP-серверы с OAuth, PTY для интерактивных процессов и полностью локальный поиск по скиллам и истории.',
        en: 'A terminal coding agent in Rust: parallel chats, sub-agents, a GOAL loop, MCP servers with OAuth, PTY for interactive processes and fully local search over skills and history.',
    },
    stack: ['Rust', 'tokio', 'Ratatui', 'MCP', 'ACP', 'ONNX'],
    facts: [
        { value: 'RAG', label: { ru: 'локальный: e5-small ONNX + TF-IDF', en: 'local: e5-small ONNX + TF-IDF' } },
        { value: 'MCP + ACP', label: { ru: 'клиент и сервер', en: 'client and server' } },
        { value: '10', label: { ru: 'пресетов тем', en: 'theme presets' } },
    ],
    links: { repo: 'https://github.com/Aver005/pooprusteek' },
    images: ['/projects/pooprusteek.webp'],
}

const poopseek: Project = {
    id: 'poopseek',
    title: 'PoopSeek',
    kind: 'tool',
    status: 'paused',
    period: { from: '2026-04', to: '2026-05' },
    role: { ru: 'соло', en: 'solo' },
    summary: {
        ru: 'Предшественник на TypeScript и Bun: автономный agent-loop, восемь LLM-провайдеров, MCP и ACP в обеих ролях, семантический поиск по коду, бинарники под пять платформ.',
        en: 'The TypeScript and Bun predecessor: an autonomous agent loop, eight LLM providers, MCP and ACP in both roles, semantic code search, binaries for five platforms.',
    },
    stack: ['TypeScript', 'Bun', 'MCP', 'ACP', 'SQLite'],
    facts: [
        { value: '8', label: { ru: 'LLM-провайдеров', en: 'LLM providers' } },
        { value: '31+', label: { ru: 'инструмент агента', en: 'agent tools' } },
        { value: '5', label: { ru: 'платформ в бинарниках', en: 'platforms compiled' } },
    ],
    links: { repo: 'https://github.com/Aver005/poopseek' },
    images: ['/projects/poopseek.webp'],
}

const otascribe: Project = {
    id: 'otascribe',
    title: 'OtaScribe',
    kind: 'product',
    status: 'active',
    period: { from: '2024' },
    role: { ru: 'фронтенд-лид в РТА Технологии', en: 'front-end lead at RTA Technologies' },
    summary: {
        ru: 'Сервис транскрибации аудио и видео: загрузил запись — получил текст с таймкодами. Интерфейс, архитектура клиентской части и команда фронтенда.',
        en: 'An audio and video transcription service: upload a recording, get text with timecodes. The interface, client-side architecture and the front-end team.',
    },
    stack: ['React', 'TypeScript'],
    facts: [],
    links: { site: 'https://app.otascribe.ru' },
    images: ['/projects/otascribe.webp'],
}

const warcube: Project = {
    id: 'warcube',
    title: 'WarCube',
    kind: 'game',
    status: 'active',
    period: { from: '2025' },
    role: { ru: 'соло: движок, сеть, сервер', en: 'solo: engine, netcode, server' },
    summary: {
        ru: '2D тактический шутер: кубический боец против волн врагов в разрушаемых аренах. Симуляция отделена от движка — один и тот же код крутится во вкладке игрока и headless в Docker; сетевой режим с предсказанием и реконсиляцией. На GitHub открыта ранняя веб-версия.',
        en: 'A 2D tactical shooter: a cube warrior against waves of enemies in destructible arenas. The simulation is separated from the engine — the same code runs in the player’s tab and headless in Docker; netcode with prediction and reconciliation. The early web version is open on GitHub.',
    },
    stack: ['Phaser 3', 'React 19', 'TanStack Start', 'WebTransport', 'Docker'],
    facts: [
        { value: 'headless', label: { ru: 'то же ядро симуляции в Docker', en: 'the same simulation core in Docker' } },
        { value: '5', label: { ru: 'одиночных режимов', en: 'solo modes' } },
        { value: 'WebTransport', label: { ru: 'сеть с предсказанием и реконсиляцией', en: 'netcode with prediction and reconciliation' } },
    ],
    links: { repo: 'https://github.com/Aver005/warcube-web' },
    images: ['/projects/warcube.webp'],
}

const maushi: Project = {
    id: 'maushi',
    title: 'Maushi',
    kind: 'product',
    status: 'active',
    period: { from: '2025' },
    role: { ru: 'фулстек соло, фриланс', en: 'solo full-stack, freelance' },
    summary: {
        ru: 'Сеть автоматизированных студий звукозаписи: сайт с онлайн-бронированием и личным кабинетом, CRM, платежи и умные замки, киоск-локер для студийных компьютеров. Один пакет типов и хуков из OpenAPI-схемы на все клиенты.',
        en: 'A chain of automated recording studios: a site with online booking and a client dashboard, a CRM, payments and smart locks, a kiosk locker for studio PCs. One package of types and hooks generated from the OpenAPI schema for every client.',
    },
    stack: ['React 19', 'Tailwind 4', 'TanStack Query', 'FastAPI', 'PostgreSQL', 'Tauri'],
    facts: [
        { value: 'OpenAPI', label: { ru: 'один пакет типов и хуков на все клиенты', en: 'one package of types and hooks for every client' } },
        { value: 'TTLock', label: { ru: 'умные замки + оплата YooKassa', en: 'smart locks + YooKassa payments' } },
        { value: 'Rust + Tauri', label: { ru: 'киоск-локер под Windows', en: 'Windows kiosk locker' } },
    ],
    links: { site: 'https://order.maushi.ru' },
    images: [
        '/projects/maushi/hero.webp',
        '/projects/maushi/studio.webp',
        '/projects/maushi/order.webp',
        '/projects/maushi/lk.webp',
    ],
}

const diary: Project = {
    id: 'diary',
    title: 'diary',
    kind: 'product',
    status: 'active',
    period: { from: '2026-08' },
    role: { ru: 'соло', en: 'solo' },
    summary: {
        ru: 'Голосовой дневник в Telegram: наговорил — получил расшифровку и запись в календаре дня. Лёгкий сервер на VDS, тяжёлый счёт дома на видеокарте: воркер сам приходит за задачами, сервер к нему не стучится.',
        en: 'A voice diary in Telegram: talk, get a transcript and an entry in the day’s calendar. A light server on a VDS, heavy compute at home on a GPU: the worker comes for jobs itself, the server never dials in.',
    },
    stack: ['Bun', 'TypeScript', 'PostgreSQL', 'Parakeet', 'Docker'],
    facts: [
        { value: '0', label: { ru: 'веб-фреймворков: чистый Bun.serve', en: 'web frameworks: plain Bun.serve' } },
        { value: 'ASR + LLM', label: { ru: 'на домашней видеокарте', en: 'on a home GPU' } },
        { value: 'NAT', label: { ru: 'воркер приходит сам', en: 'the worker dials out' } },
    ],
    links: {},
    images: [],
}

export const SHOWCASE: readonly ShowcaseEntry[] = [
    { type: 'single', project: craws },
    {
        type: 'pair',
        label: { ru: 'переписан с TypeScript на Rust', en: 'rewritten from TypeScript to Rust' },
        projects: [poopseek, pooprusteek],
    },
    { type: 'single', project: otascribe },
    { type: 'single', project: warcube },
    { type: 'single', project: maushi },
    { type: 'single', project: diary },
]

/** Компактный ряд: то, у чего нет демки и картинок, но есть что сказать */
export const TOOLS: readonly Project[] = [
    {
        id: 'root-panel',
        title: 'root-panel',
        kind: 'product',
        status: 'active',
        period: { from: '2026-08' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Панель управления сервером: docker, git, логи, терминал, сессии агентов с телефона. Обязательный TOTP, лимиты на аккаунт, Android-обёртка.',
            en: 'A server control panel: docker, git, logs, terminal, agent sessions from the phone. Mandatory TOTP, per-account rate limits, an Android wrapper.',
        },
        stack: ['Bun', 'Hono', 'Drizzle', 'React', 'xterm.js', 'Capacitor'],
        facts: [],
        links: {},
        images: [],
    },
    {
        id: 'tg-multi-tool',
        title: 'tg-multi-tool',
        kind: 'tool',
        status: 'active',
        period: { from: '2026-09' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Бот: ссылка на YouTube — минус, вокал, mp3 и текст песни; голосовое — расшифровка. Воркер за NAT приходит за задачами сам.',
            en: 'A bot: a YouTube link — instrumental, vocals, mp3 and lyrics; a voice message — a transcript. The worker behind NAT comes for jobs itself.',
        },
        stack: ['Bun', 'grammY', 'Drizzle', 'PostgreSQL'],
        facts: [],
        links: {},
        images: [],
    },
    {
        id: 'kiviuly',
        title: 'kiviuly',
        kind: 'product',
        status: 'active',
        period: { from: '2026-06' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Лендинг студии в одном образе и на одном порту: Bun.serve отдаёт SPA, API и SQLite; антибот на proof-of-work вместо капчи.',
            en: 'A studio landing in one image on one port: Bun.serve serves the SPA, the API and SQLite; proof-of-work instead of a captcha.',
        },
        stack: ['Bun', 'React 19', 'Tailwind 4', 'Motion'],
        facts: [],
        links: { site: 'https://kiviuly.ru', repo: 'https://github.com/Aver005/kiviuly-app' },
        images: [],
    },
    {
        id: 'flowest',
        title: 'flowest',
        kind: 'tool',
        status: 'paused',
        period: { from: '2026-07' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Самовосстанавливающиеся браузерные сценарии: детерминированный replay без единого вызова LLM, лечение сломанного шага против живой страницы.',
            en: 'Self-healing browser flows: deterministic replay without a single LLM call, healing a broken step against the live page.',
        },
        stack: ['Bun', 'Playwright', 'TypeScript'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/flowest' },
        images: [],
    },
    {
        id: 'dot-memories-ext',
        title: 'dot-memories-ext',
        kind: 'tool',
        status: 'active',
        period: { from: '2026-09' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Расширение VS Code для книги знаний .memories/: ноль рантайм-зависимостей, бандл 30 КБ, ядро без API редактора и покрыто тестами.',
            en: 'A VS Code extension for the .memories/ knowledge book: zero runtime dependencies, a 30 KB bundle, a core free of the editor API and covered by tests.',
        },
        stack: ['TypeScript', 'esbuild', 'VS Code API'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/dot-memories-ext' },
        images: [],
    },
    {
        id: 'glw',
        title: 'glw',
        kind: 'tool',
        status: 'active',
        period: { from: '2026-07' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'CLI для GitLab work items через GraphQL: ноль зависимостей, покрыт тестами, есть навык для агентов.',
            en: 'A CLI for GitLab work items over GraphQL: zero dependencies, covered by tests, ships a skill for agents.',
        },
        stack: ['Bun', 'TypeScript', 'GraphQL'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/gitlab-worker' },
        images: [],
    },
    {
        id: 'ins',
        title: 'ins',
        kind: 'tool',
        status: 'paused',
        period: { from: '2026-06' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Пакетный менеджер для npm-экосистемы на Rust: CAS-хранилище, hardlink-и, читает локфайлы bun, pnpm и npm.',
            en: 'A package manager for the npm ecosystem in Rust: a CAS store, hardlinks, reads bun, pnpm and npm lockfiles.',
        },
        stack: ['Rust'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/ins-package-manager' },
        images: [],
    },
    {
        id: 'deep-reverse',
        title: 'deep-reverse',
        kind: 'tool',
        status: 'archived',
        period: { from: '2026-06', to: '2026-06' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Реверс веб-API DeepSeek: документация в 16 глав, JSON Schema, типы, PoW через WASM, SSE-протокол. Фундамент PoopSeek.',
            en: 'Reverse engineering of the DeepSeek web API: 16 chapters of docs, JSON Schema, types, PoW via WASM, the SSE protocol. The foundation of PoopSeek.',
        },
        stack: ['TypeScript', 'Bun'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/deep-reverse' },
        images: [],
    },
    {
        id: 'kiviuly-minigames',
        title: 'kiviuly minigames',
        kind: 'game',
        status: 'paused',
        period: { from: '2026-07' },
        role: { ru: 'соло', en: 'solo' },
        summary: {
            ru: 'Плагины мини-игр для Minecraft-сервера на Paper API: Escape, SkyWars, SkyBlockWars и общее ядро режимов.',
            en: 'Minigame plugins for a Minecraft server on the Paper API: Escape, SkyWars, SkyBlockWars and a shared mode core.',
        },
        stack: ['Java', 'Paper API', 'Gradle'],
        facts: [],
        links: { repo: 'https://github.com/Aver005/kiviuly-minigame-core' },
        images: [],
    },
    {
        id: 'pocacall',
        title: 'Pocacall',
        kind: 'product',
        status: 'archived',
        period: { from: '2025', to: '2026-03' },
        role: { ru: 'фронтенд и часть бэкенда', en: 'front-end and part of the backend' },
        summary: {
            ru: 'Видеозвонки без регистрации: зашёл по ссылке — уже в комнате. WebRTC и LiveKit под капотом.',
            en: 'Video calls with zero sign-up: open the link and you are in the room. WebRTC and LiveKit under the hood.',
        },
        stack: ['React', 'LiveKit', 'Bun', 'Elysia'],
        facts: [],
        links: {},
        images: [],
    },
]

export const ALL_PROJECTS: readonly Project[] = [
    ...SHOWCASE.flatMap((entry) => (entry.type === 'pair' ? entry.projects : [entry.project])),
    ...TOOLS,
]
