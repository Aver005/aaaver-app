function num(value: string | undefined, fallback: number): number {
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

/**
 * Обязательная переменная окружения.
 *
 * В проде отсутствие роняет процесс сразу, и это не строгость ради строгости:
 * пустой `DATABASE_URL` — это опечатка в развёртывании, а не временная
 * неполадка. Автодеплой ждёт `/api/health`, поэтому кричащее падение всплывёт
 * на выкатке, а не через неделю первым несработавшим письмом. Недоступный
 * Postgres — случай ДРУГОЙ: он лечится сам и падением не считается
 * (см. `db/index.ts`).
 *
 * Вне прода — предупреждение: `bun run build`, `preview` и правка фронтенда
 * не должны требовать поднятой базы.
 */
function requiredInProd(name: string, value: string | undefined): string {
    if (value) return value
    if (process.env.NODE_ENV === 'production') {
        console.error(`[config] ${name} не задан — без него сервер работать не может`)
        process.exit(1)
    }
    console.warn(`[config] ${name} не задан: всё, что ходит в базу, будет отвечать 503`)
    return ''
}

export const config = {
    port: num(process.env.PORT, 3000),
    /** Postgres стека: своя роль и своя база, `sslmode=require` (см. db/client.ts) */
    databaseUrl: requiredInProd('DATABASE_URL', process.env.DATABASE_URL),
    /** каталог с демками: каждая папка `<slug>/` с index.html = роут `/<slug>/` */
    sitesDir: process.env.SITES_DIR ?? './sites',
    /** внутренний /reload апдейтера; в докере — имя сервиса из compose */
    sitesUpdaterUrl: process.env.SITES_UPDATER_URL ?? 'http://localhost:8484',
    /** токен для POST /api/sites-reload; пустой = эндпоинт выключен */
    sitesReloadToken: process.env.SITES_RELOAD_TOKEN ?? '',

    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    chatId: process.env.TELEGRAM_CHAT_ID ?? '',

    /** битов нулей в начале sha256 — 14 решается у клиента за доли секунды */
    powDifficulty: clamp(num(process.env.POW_DIFFICULTY, 14), 8, 24),
    /** сколько живёт выданный challenge */
    challengeTtlMs: 15 * 60 * 1000,
    /** минимум времени от выдачи challenge до отправки — боты торопятся */
    minSubmitDelayMs: 2000,

    ratePerHour: num(process.env.RATE_LIMIT_PER_HOUR, 5),
    ratePerDay: num(process.env.RATE_LIMIT_PER_DAY, 20),
    challengesPerHour: 30,

    trustProxy: process.env.TRUST_PROXY === '1',

    // --- Админка: вход через панель root.kiviuly.ru ---

    /**
     * Кто выдаёт утверждение о личности. Сверяется с полем `iss` токена:
     * без этой проверки утверждение, подписанное тем же секретом на другом
     * стенде панели, прошло бы здесь как своё.
     */
    ssoIssuer: process.env.SSO_ISSUER ?? 'https://root.kiviuly.ru',
    /** Имя этого проекта в реестре панели */
    ssoClientId: process.env.SSO_CLIENT_ID ?? 'aaaver-admin',
    /**
     * Общий секрет — он же ключ HMAC, которым панель подписала токен.
     * Пустой = админка выключена целиком, и это правильное умолчание:
     * ненастроенный вход не должен открываться сам собой.
     */
    ssoClientSecret: process.env.SSO_CLIENT_SECRET ?? '',
    /**
     * Адрес возврата. Панель сверяет его ПОСИМВОЛЬНО со своим реестром, так
     * что здесь и там должна стоять буквально одна и та же строка — лишний
     * слэш на конце уже другой адрес.
     */
    ssoRedirectUri: process.env.SSO_REDIRECT_URI ?? 'https://aaaver.ru/api/admin/sso/callback',
    /**
     * Кого пускать. Панель ролей в токене не отдаёт намеренно: она отвечает
     * на вопрос «это точно тот человек», а кого пускать — решает клиент.
     */
    adminEmails: (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean),
    /** Допуск на расхождение часов при проверке `exp`/`iat` */
    ssoClockSkewSec: 5,
    /** Сколько живёт `state` между уходом в панель и возвратом */
    ssoStateTtlMs: 5 * 60 * 1000,
    /** Сколько живёт сессия админки */
    adminSessionTtlMs: 12 * 60 * 60 * 1000,

    githubUser: 'Aver005',
    githubCacheTtlMs: 6 * 60 * 60 * 1000,

    isProd: process.env.NODE_ENV === 'production',
} as const
