import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sql } from './client'

/**
 * Раннер миграций: файлы `migrations/*.sql` по порядку имён, применённые
 * отмечены в `schema_migrations`.
 *
 * Почему не `CREATE TABLE IF NOT EXISTS` на старте, как было в SQLite: там
 * схема была написана один раз и не менялась. Дальше она будет меняться
 * (реестр сайтов, сессии, аудит), а `IF NOT EXISTS` не умеет ни добавить
 * колонку, ни переименовать её, ни сказать, какая версия схемы сейчас в базе.
 *
 * Каждый файл применяется В ОДНОЙ ТРАНЗАКЦИИ вместе с отметкой о себе:
 * Postgres умеет транзакционный DDL, поэтому упавшая на середине миграция не
 * оставляет базу в половинчатом состоянии и не считается применённой.
 */
const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations', import.meta.url))

/**
 * Ключ advisory-блокировки. Произвольная константа — важно лишь, чтобы её не
 * заняли соседи по инстансу Postgres, поэтому число выбрано «своё».
 *
 * Блокировка транзакционная (`_xact_`), а не сессионная, намеренно: сессионную
 * пришлось бы снимать вручную и на том же соединении, а соединения берутся из
 * пула — снять её на другом уже не выйдет. Транзакционная отпускается сама
 * вместе с транзакцией, в том числе при падении.
 */
const LOCK_KEY = 8_242_001

export async function migrate(): Promise<void> {
    await sql`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            name       text PRIMARY KEY,
            applied_at timestamptz NOT NULL DEFAULT now()
        )
    `

    const files = (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith('.sql')).sort()

    for (const file of files) {
        const body = await Bun.file(join(MIGRATIONS_DIR, file)).text()

        await sql.begin(async (tx) => {
            await tx`SELECT pg_advisory_xact_lock(${LOCK_KEY})`

            // Проверка ВНУТРИ блокировки, а не снаружи: наружная прочитала бы
            // состояние до того, как соседний процесс успел применить ту же
            // миграцию, и мы применили бы её второй раз.
            const [seen] = await tx`SELECT 1 AS ok FROM schema_migrations WHERE name = ${file}`
            if (seen) return

            await tx.unsafe(body)
            await tx`INSERT INTO schema_migrations (name) VALUES (${file})`
            console.log(`[db] миграция ${file} применена`)
        })
    }
}
