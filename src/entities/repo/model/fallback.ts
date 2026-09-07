import type { RepoInfo } from '@/shared/api'

/** Дата снимка — показывается вместо «живого» списка, когда GitHub недоступен */
export const REPOS_SNAPSHOT_DATE = '2026-09-06'

/**
 * Снимок данных GitHub на момент сборки. Показывается, пока живой ответ
 * /api/github/repos едет по сети, и если GitHub недоступен.
 * Обновляется скриптом scripts/repos-snapshot.ts, руками не править.
 */
export const REPOS_FALLBACK: RepoInfo[] = [
    {
        name: 'PoopRusteek',
        url: 'https://github.com/Aver005/PoopRusteek',
        description: 'Терминальный AI-агент для кодинга на Rust поверх веб-API DeepSeek — событийный цикл на tokio, где каждая беседа владеет своим изолированным провайдером, что даёт параллельные чаты, сайдчаты и саб-агентов без потери стрима.',
        language: 'Rust',
        stars: 1,
        topics: ['agent', 'claude', 'deepseek', 'llm', 'rust'],
        pushedAt: '2026-09-06T10:58:49Z',
    },
    {
        name: 'dot-memories-ext',
        url: 'https://github.com/Aver005/dot-memories-ext',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-09-05T22:49:08Z',
    },
    {
        name: 'kiviuly-app',
        url: 'https://github.com/Aver005/kiviuly-app',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-08-26T15:52:12Z',
    },
    {
        name: 'flowest',
        url: 'https://github.com/Aver005/flowest',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-07-26T21:46:27Z',
    },
    {
        name: 'skyblockwars-reborn',
        url: 'https://github.com/Aver005/skyblockwars-reborn',
        description: null,
        language: 'Java',
        stars: 0,
        topics: ['gradle', 'java', 'minecraft', 'minigame', 'plugin', 'skyblock'],
        pushedAt: '2026-07-24T15:50:26Z',
    },
    {
        name: 'escape-reborn',
        url: 'https://github.com/Aver005/escape-reborn',
        description: null,
        language: 'Java',
        stars: 0,
        topics: ['gradle', 'java', 'minecraft', 'minigame', 'minigame-plugin', 'plugin'],
        pushedAt: '2026-07-24T15:50:24Z',
    },
    {
        name: 'skywars-reborn',
        url: 'https://github.com/Aver005/skywars-reborn',
        description: null,
        language: 'Java',
        stars: 0,
        topics: ['claude', 'java', 'minecraft', 'minigame', 'plugin', 'skywars'],
        pushedAt: '2026-07-24T15:49:05Z',
    },
    {
        name: 'kiviuly-minigame-core',
        url: 'https://github.com/Aver005/kiviuly-minigame-core',
        description: null,
        language: 'Java',
        stars: 0,
        topics: [],
        pushedAt: '2026-07-24T12:26:51Z',
    },
    {
        name: 'craws-landing',
        url: 'https://github.com/Aver005/craws-landing',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-07-08T23:40:56Z',
    },
    {
        name: 'craws',
        url: 'https://github.com/Aver005/craws',
        description: '🦀 Craws — a BLAZING-fast, automation-first image editor built for developers. Powered by a tiled, content-hash-cached Rust engine that works in linear-light f32 color, it ships as a headless CLI and an MCP server so AI agents can annotate, compose, and transform images directly. 🖼️⚡ Pixels never travel as JSON — every claim is backed by benchmark',
        language: 'Rust',
        stars: 0,
        topics: ['blazing', 'cli', 'editor', 'gimp', 'image', 'image-editing', 'image-processing', 'mcp', 'model-context-protocol', 'open-source', 'photoshop', 'rust'],
        pushedAt: '2026-07-08T02:37:35Z',
    },
    {
        name: 'poopseek-landing',
        url: 'https://github.com/Aver005/poopseek-landing',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-07-08T00:17:46Z',
    },
    {
        name: 'pooprusteek-landing',
        url: 'https://github.com/Aver005/pooprusteek-landing',
        description: null,
        language: 'TypeScript',
        stars: 0,
        topics: [],
        pushedAt: '2026-07-05T02:41:48Z',
    },
]
