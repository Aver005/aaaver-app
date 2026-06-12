function num(value: string | undefined, fallback: number): number {
    const n = Number(value)
    return Number.isFinite(n) && n > 0 ? n : fallback
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export const config = {
    port: num(process.env.PORT, 3000),
    dbPath: process.env.DATABASE_PATH ?? './data/aaaver.db',

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

    githubUser: 'Aver005',
    githubCacheTtlMs: 6 * 60 * 60 * 1000,

    isProd: process.env.NODE_ENV === 'production',
} as const
