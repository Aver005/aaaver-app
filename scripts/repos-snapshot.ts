/**
 * Обновляет снимок репозиториев для фолбэка секции Open Source тем же
 * фильтром, что и сервер: `bun scripts/repos-snapshot.ts`.
 * Базы не требует; `GITHUB_TOKEN`, если задан, поднимает лимит API.
 */
import { fetchFromGithub } from '../server/lib/github'

const TARGET = new URL('../src/entities/repo/model/fallback.ts', import.meta.url)
const USER = 'Aver005'

const repos = await fetchFromGithub({ user: USER, token: process.env.GITHUB_TOKEN })
const today = new Date().toISOString().slice(0, 10)

const lines = repos.map((r) =>
    [
        '    {',
        `        name: ${q(r.name)},`,
        `        url: ${q(r.url)},`,
        `        description: ${r.description === null ? 'null' : q(r.description)},`,
        `        language: ${r.language === null ? 'null' : q(r.language)},`,
        `        stars: ${r.stars},`,
        `        topics: [${r.topics.map(q).join(', ')}],`,
        `        pushedAt: ${q(r.pushedAt)},`,
        '    },',
    ].join('\n'),
)

const out = `import type { RepoInfo } from '@/shared/api'

/** Дата снимка — показывается вместо «живого» списка, когда GitHub недоступен */
export const REPOS_SNAPSHOT_DATE = '${today}'

/**
 * Снимок данных GitHub на момент сборки. Показывается, пока живой ответ
 * /api/github/repos едет по сети, и если GitHub недоступен.
 * Обновляется скриптом scripts/repos-snapshot.ts, руками не править.
 */
export const REPOS_FALLBACK: RepoInfo[] = [
${lines.join('\n')}
]
`

await Bun.write(TARGET, out)
console.log(`снимок обновлён: ${repos.length} репозиториев, ${today}`)

/** Строка в одинарных кавычках в стиле кода: JSON-экранирование, кавычки заменены */
function q(value: string): string {
    const inner = JSON.stringify(value).slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")
    return `'${inner}'`
}
