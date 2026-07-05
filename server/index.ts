import { config } from './config'
import { cleanup } from './db'
import { json } from './lib/http'
import { resolveChatId } from './lib/telegram'
import { handleChallenge } from './routes/challenge'
import { handleContact, retryUndelivered } from './routes/contact'
import { handleGithubRepos } from './routes/github'
import { handleSites, handleSitesReload } from './routes/sites'
import { serveStatic } from './lib/static'

const server = Bun.serve({
    port: config.port,
    routes: {
        '/api/health': () => json({ ok: true }),
        '/api/challenge': { POST: handleChallenge },
        '/api/contact': { POST: handleContact },
        '/api/github/repos': { GET: handleGithubRepos },
        '/api/sites': { GET: handleSites },
        '/api/sites-reload': { POST: handleSitesReload },
    },
    fetch(req) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/api/')) return json({ error: 'not-found' }, 404)
        return serveStatic(req)
    },
    error(err) {
        console.error('[server]', err)
        return json({ error: 'server' }, 500)
    },
})

// раз в 10 минут: чистим протухшие challenge и досылаем недоставленное
setInterval(
    () => {
        cleanup()
        void retryUndelivered()
    },
    10 * 60 * 1000,
)

console.log(`[server] слушаю http://localhost:${server.port}`)
console.log(`[server] sqlite: ${config.dbPath}`)
console.log(`[server] pow difficulty: ${config.powDifficulty} бит`)

if (!config.botToken) {
    console.warn('[server] TELEGRAM_BOT_TOKEN пуст — сообщения будут копиться в БД')
} else {
    void resolveChatId().then((id) => {
        if (id) console.log(`[telegram] готов, chat_id: ${id}`)
        else console.warn('[telegram] chat_id не найден: напишите боту /start (или bun run chat-id)')
    })
}
