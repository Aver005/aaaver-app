/**
 * Разовый перенос данных из старой SQLite в Postgres.
 *
 *   bun scripts/migrate-sqlite-to-pg.ts [путь/к/aaaver.db]
 *
 * Переносится только то, что нельзя восстановить:
 *
 *   messages — переписка с формы, единственное по-настоящему ценное;
 *   settings — найденный chat_id и кэш GitHub (кэш переживёт и без этого,
 *              но перенести его дешевле, чем ходить в API заново).
 *
 * `challenges` и `attempts` НЕ переносятся сознательно: первые живут час,
 * вторые сутки, и обе таблицы существуют ровно для того, чтобы протухать.
 * Перенос дал бы только лишний код и лишние строки, которые сервер удалил бы
 * на первом же обслуживании.
 *
 * На сервере запускать с адресом Postgres, видимым С ХОСТА, — в `.env` там
 * стоит имя контейнера `pg`, которое вне docker-сети не резолвится:
 *
 *   DATABASE_URL='postgres://aaaver:...@127.0.0.1:5432/aaaverdb?sslmode=require' \
 *     bun scripts/migrate-sqlite-to-pg.ts
 */
import { Database } from 'bun:sqlite'
import { migrate } from '../server/db/migrate'
import { sql } from '../server/db/client'

const dbPath = process.argv[2] ?? process.env.DATABASE_PATH ?? './data/aaaver.db'
const force = process.argv.includes('--force')

if (!(await Bun.file(dbPath).exists())) {
    console.error(`Файла ${dbPath} нет — переносить нечего.`)
    process.exit(1)
}

console.log(`[migrate] источник: ${dbPath}`)
const sqlite = new Database(dbPath, { readonly: true })

await migrate()

// Защита от второго запуска: он продублировал бы всю переписку. `--force`
// оставлен для случая, когда повтор осознанный (например, после ручной
// чистки цели).
const [existing] = await sql`SELECT count(*)::int AS n FROM messages`
if ((existing!.n as number) > 0 && !force) {
    console.error(
        `В Postgres уже ${existing!.n} сообщений — перенос отменён. ` +
            'Если это осознанный повтор, добавьте --force.',
    )
    process.exit(1)
}

interface SqliteMessage {
    id: number
    name: string
    contact: string
    message: string
    locale: string
    ip: string
    user_agent: string
    spam_flags: string
    delivered: number
    delivery_attempts: number
    created_at: number
}

const messages = sqlite.query('SELECT * FROM messages ORDER BY id').all() as SqliteMessage[]
const settings = sqlite.query('SELECT key, value FROM settings').all() as Array<{
    key: string
    value: string
}>

await sql.begin(async (tx) => {
    for (const m of messages) {
        // `OVERRIDING SYSTEM VALUE` — потому что id колонка GENERATED ALWAYS,
        // а сохранить исходные номера хочется: по ним потом сходится счёт
        // «столько же строк, тот же максимум».
        //
        // created_at в SQLite лежал секундами unixepoch, здесь timestamptz.
        await tx`
            INSERT INTO messages (
                id, name, contact, message, locale, ip, user_agent,
                spam_flags, delivered, delivery_attempts, created_at
            )
            OVERRIDING SYSTEM VALUE
            VALUES (
                ${m.id}, ${m.name}, ${m.contact}, ${m.message}, ${m.locale}, ${m.ip},
                ${m.user_agent}, ${m.spam_flags || '[]'}::jsonb, ${m.delivered},
                ${m.delivery_attempts}, to_timestamp(${m.created_at})
            )
        `
    }

    // Последовательность идентификаторов не знает про вставленные вручную
    // номера: без этого первое же новое сообщение получило бы id = 1 и
    // упало бы на конфликте ключа.
    if (messages.length > 0) {
        await tx`
            SELECT setval(
                pg_get_serial_sequence('messages', 'id'),
                (SELECT max(id) FROM messages)
            )
        `
    }

    for (const s of settings) {
        await tx`
            INSERT INTO settings (key, value) VALUES (${s.key}, ${s.value})
            ON CONFLICT (key) DO UPDATE SET value = excluded.value
        `
    }
})

const [after] = await sql`SELECT count(*)::int AS n, coalesce(max(id), 0)::int AS top FROM messages`
console.log(`[migrate] сообщений перенесено: ${messages.length}, в Postgres теперь ${after!.n} (max id ${after!.top})`)
console.log(`[migrate] настроек перенесено: ${settings.length}`)

sqlite.close()
await sql.end()
