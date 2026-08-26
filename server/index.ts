import { config } from './config'
import { cleanup, dbLastError, dbReady, isConnectionError, DbUnavailableError, pingDb, startDb } from './db'
import { json } from './lib/http'
import { resolveChatId } from './lib/telegram'
import { handleChallenge } from './routes/challenge'
import { handleContact, retryUndelivered } from './routes/contact'
import { handleGithubRepos } from './routes/github'
import { handleSites, handleSitesReload } from './routes/sites'
import {
    adminEnabled,
    handleAdminCallback,
    handleAdminLogin,
    handleAdminLogout,
    handleAdminMe,
    handleAdminReload,
    handleAdminSiteCreate,
    handleAdminSiteDelete,
    handleAdminSites,
    handleAdminSiteUpdate,
} from './routes/admin'
import { serveStatic } from './lib/static'

/**
 * Схема применяется в фоне: `depends_on: postgres` в этом проекте недоступен
 * (см. db/client.ts), и сервер обязан начать отдавать статику, не дожидаясь
 * базы. Промис нужен только для того, что имеет смысл делать уже с базой.
 */
const dbUp = startDb()

const server = Bun.serve({
    port: config.port,
    routes: {
        /**
         * `ok` — жив ли процесс, `db` — отвечает ли Postgres прямо сейчас.
         *
         * Ответ остаётся 200 даже при лежащей базе, и это не небрежность:
         * на этот адрес смотрит healthcheck докера, а перезапускать контейнер
         * из-за недоступной базы бессмысленно — портфолио и демки при ней не
         * нужны и продолжают работать. Кто хочет знать про базу, читает поле.
         */
        '/api/health': async () => json({ ok: true, db: await pingDb(), dbError: dbLastError() }),
        '/api/challenge': { POST: handleChallenge },
        '/api/contact': { POST: handleContact },
        '/api/github/repos': { GET: handleGithubRepos },
        '/api/sites': { GET: handleSites },
        '/api/sites-reload': { POST: handleSitesReload },

        // Админка. `login` и `callback` — единственные, куда приходят
        // навигацией браузера, поэтому отвечают страницей, а не JSON.
        '/api/admin/login': { GET: handleAdminLogin },
        '/api/admin/sso/callback': { POST: handleAdminCallback },
        '/api/admin/logout': { POST: handleAdminLogout },
        '/api/admin/me': { GET: handleAdminMe },
        '/api/admin/sites': { GET: handleAdminSites, POST: handleAdminSiteCreate },
        '/api/admin/sites/:slug': { PATCH: handleAdminSiteUpdate, DELETE: handleAdminSiteDelete },
        '/api/admin/reload': { POST: handleAdminReload },
    },
    fetch(req) {
        const url = new URL(req.url)
        if (url.pathname.startsWith('/api/')) return json({ error: 'not-found' }, 404)
        return serveStatic(req)
    },
    /**
     * Недоступная база — это 503 «зайдите позже», а не 500 «у нас сломалось».
     * Разница важна и посетителю, и мониторингу: 500 требует чинить код, 503
     * пройдёт сам, когда Postgres вернётся.
     */
    error(err) {
        if (err instanceof DbUnavailableError || isConnectionError(err)) {
            // Без стектрейса: причина уже расписана строками `[db] недоступен`,
            // а на каждый запрос к лежащей базе сюда прилетает по одной ошибке.
            console.error(`[server] запрос к базе не прошёл: ${err.message}`)
            return json({ error: 'db-unavailable' }, 503)
        }
        console.error('[server]', err)
        return json({ error: 'server' }, 500)
    },
})

// Раз в десять минут: чистим протухшие challenge и досылаем недоставленное.
//
// `Bun.cron`, а не `setInterval`: расписание считает рантайм, и он же не даёт
// двум запускам наложиться друг на друга. Прошлый вариант этого не обещал —
// досылка ходит в Telegram по сети, и на десяти зависших запросах следующий
// тик начинался поверх незакончившегося.
Bun.cron('*/10 * * * *', async () => {
    // База ещё не поднялась — обслуживать нечего, следующий тик попробует снова.
    if (!dbReady()) return
    try {
        await cleanup()
        await retryUndelivered()
    } catch (error) {
        // Упавшее обслуживание не повод ронять сервер: следующий тик придёт
        // через десять минут и попробует снова.
        console.error('[maintenance]', error)
    }
})

/** Адрес базы без пароля: строка подключения целиком в журнал попадать не должна. */
function dbTarget(url: string): string {
    try {
        const parsed = new URL(url)
        return `${parsed.host}${parsed.pathname}`
    } catch {
        return 'не задан'
    }
}

console.log(`[server] слушаю http://localhost:${server.port}`)
console.log(`[server] postgres: ${dbTarget(config.databaseUrl)}`)
console.log(`[server] pow difficulty: ${config.powDifficulty} бит`)

if (adminEnabled()) {
    console.log(`[admin] вход через ${config.ssoIssuer}, допущены: ${config.adminEmails.join(', ')}`)
} else {
    console.warn('[admin] выключена: нужны SSO_CLIENT_SECRET и ADMIN_EMAILS')
}

if (!config.botToken) {
    console.warn('[server] TELEGRAM_BOT_TOKEN пуст — сообщения будут копиться в БД')
} else {
    // Ждём базу: chat_id сначала ищется в settings, а до появления схемы
    // этот запрос упал бы необработанным отказом промиса.
    void dbUp.then(resolveChatId).then((id) => {
        if (id) console.log(`[telegram] готов, chat_id: ${id}`)
        else console.warn('[telegram] chat_id не найден: напишите боту /start (или bun run chat-id)')
    })
}
