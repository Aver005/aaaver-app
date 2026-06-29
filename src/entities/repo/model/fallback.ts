import type { RepoInfo } from '@/shared/api'

/**
 * Снимок данных GitHub на момент сборки. Используется, пока живой
 * ответ /api/github/repos едет по сети, и как запасной вариант,
 * если GitHub недоступен.
 */
export const REPOS_FALLBACK: RepoInfo[] = [
    {
        name: 'ins-package-manager',
        url: 'https://github.com/Aver005/ins-package-manager',
        description: null,
        language: 'Rust',
        stars: 0,
        topics: [],
        pushedAt: '2026-06-03T10:55:25Z',
    },
    {
        name: 'pooprusteek',
        url: 'https://github.com/Aver005/pooprusteek',
        description:
            'Быстрый TUI-кодинг-агент на Rust: Ratatui, Catppuccin, потоковый вывод, MCP и ACP.',
        language: 'Rust',
        stars: 0,
        topics: ['agent', 'ai', 'rust', 'cli', 'tui'],
        pushedAt: '2026-06-28T00:00:00Z',
    },
    {
        name: 'poopseek',
        url: 'https://github.com/Aver005/poopseek',
        description:
            'Инструментный ИИ-агент с доступом к файловой системе и shell-командам, написанный на TypeScript (Bun).',
        language: 'TypeScript',
        stars: 1,
        topics: ['agent', 'ai', 'bun', 'cli'],
        pushedAt: '2026-05-22T16:35:33Z',
    },
    {
        name: 'Tanstack-Start-Template',
        url: 'https://github.com/Aver005/Tanstack-Start-Template',
        description: 'Tanstack Start Template',
        language: 'TypeScript',
        stars: 0,
        topics: ['react', 'tanstack', 'tailwind'],
        pushedAt: '2026-05-19T23:22:38Z',
    },
    {
        name: 'deepaude',
        url: 'https://github.com/Aver005/deepaude',
        description:
            'Прокси-сервер, превращающий DeepSeek Chat в полностью совместимый с Anthropic API endpoint.',
        language: 'TypeScript',
        stars: 0,
        topics: ['ai', 'api', 'bridge'],
        pushedAt: '2026-04-24T00:00:00Z',
    },
    {
        name: 'agent-skills',
        url: 'https://github.com/Aver005/agent-skills',
        description:
            'Набор скиллов для AI-агентов: 40+ экспертных гайдов по Frontend, Backend и инфраструктуре.',
        language: 'TypeScript',
        stars: 1,
        topics: [],
        pushedAt: '2026-04-21T00:00:00Z',
    },
    {
        name: 'tanstack-template',
        url: 'https://github.com/Aver005/tanstack-template',
        description:
            'Production-ready фуллстек-шаблон на TanStack Start, React 19, Bun, Tailwind v4 и Drizzle ORM.',
        language: 'TypeScript',
        stars: 1,
        topics: ['bun', 'docker', 'fsd', 'tanstack'],
        pushedAt: '2026-03-14T00:00:00Z',
    },
]
