import { isConnectionError, isUniqueViolation, sql } from './client'
import { migrate } from './migrate'

export { sql, isConnectionError, isUniqueViolation }

/**
 * Готовность базы = «схема применена». Флаг, а не проверка на каждый запрос:
 * миграции прогоняются один раз на старте, и повторно спрашивать об этом
 * Postgres на каждый чих незачем.
 *
 * Сам факт того, что Postgres отвечает ПРЯМО СЕЙЧАС, — отдельный вопрос
 * (`pingDb`): база могла уехать на перезапуск уже после того, как схема была
 * применена, и обратно она вернётся с той же схемой.
 */
let schemaReady = false
let lastError: string | null = null

export function dbReady(): boolean {
    return schemaReady
}

export function dbLastError(): string | null {
    return lastError
}

/**
 * База недоступна — это 503, а не 500.
 *
 * Отдельный класс, потому что отличать надо в одном месте (обработчик ошибок
 * сервера), а бросать — из многих.
 */
export class DbUnavailableError extends Error {
    constructor() {
        super('postgres недоступен')
        this.name = 'DbUnavailableError'
    }
}

/**
 * Ставится в начало любого обработчика, которому нужна база.
 *
 * Без неё запрос к непроинициализированной схеме упал бы ошибкой «relation
 * does not exist» — то есть 500 и стектрейс вместо честного «сервис
 * временно недоступен».
 */
export function requireDb(): void {
    if (!schemaReady) throw new DbUnavailableError()
}

/**
 * Применяет схему; при недоступном Postgres повторяет в фоне и НЕ БРОСАЕТ.
 *
 * Именно так, а не `await` на старте: портфолио и демки — статика, они
 * обязаны отдаваться и при лежащей базе. Падение процесса здесь означало бы,
 * что перезапуск Postgres роняет заодно и сайт-визитку, которой база не
 * нужна вовсе.
 *
 * Возвращённый промис резолвится, когда схема применена, и НЕ ОТКЛОНЯЕТСЯ
 * никогда — на него можно повесить то, что должно случиться после появления
 * базы (поиск chat_id телеграма), не рискуя необработанным отказом.
 */
export function startDb(): Promise<void> {
    return (async () => {
        let delay = 2000
        for (;;) {
            try {
                await migrate()
                schemaReady = true
                lastError = null
                console.log('[db] postgres готов, схема применена')
                return
            } catch (error) {
                lastError = error instanceof Error ? error.message : String(error)
                console.error(`[db] недоступен: ${lastError} — повтор через ${delay / 1000} с`)
                await Bun.sleep(delay)
                delay = Math.min(delay * 2, 60_000)
            }
        }
    })()
}

/** Отвечает ли Postgres прямо сейчас — для `/api/health`. */
export async function pingDb(): Promise<boolean> {
    if (!schemaReady) return false
    try {
        await sql`SELECT 1`
        return true
    } catch {
        return false
    }
}

export async function getSetting(key: string): Promise<string | null> {
    const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`
    return (row?.value as string | undefined) ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
    await sql`
        INSERT INTO settings (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = excluded.value
    `
}

/**
 * Чистка протухшего. Окна считает Postgres — в коде миллисекунд больше нет.
 */
export async function cleanup(): Promise<void> {
    await sql`DELETE FROM challenges WHERE issued_at < now() - interval '1 hour'`
    await sql`DELETE FROM attempts WHERE at < now() - interval '25 hours'`
    await sql`DELETE FROM admin_sessions WHERE expires_at < now()`
    // Утверждение панели живёт минуту; час — запас на расхождение часов и на
    // то, чтобы повтор из журнала прокси всё-таки упёрся в отказ, а не прошёл.
    await sql`DELETE FROM sso_used_tokens WHERE used_at < now() - interval '1 hour'`
}
