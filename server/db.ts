import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { config } from './config'

const absolutePath = resolve(config.dbPath)
mkdirSync(dirname(absolutePath), { recursive: true })

export const db = new Database(absolutePath, { create: true })

// WAL переживает параллельные чтения и внезапные рестарты контейнера
db.run('PRAGMA journal_mode = WAL')
db.run('PRAGMA busy_timeout = 5000')
db.run('PRAGMA synchronous = NORMAL')

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT NOT NULL,
        message TEXT NOT NULL,
        locale TEXT NOT NULL DEFAULT 'ru',
        ip TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        spam_flags TEXT NOT NULL DEFAULT '[]',
        delivered INTEGER NOT NULL DEFAULT 0,
        delivery_attempts INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS challenges (
        id TEXT PRIMARY KEY,
        salt TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        ip TEXT NOT NULL DEFAULT '',
        issued_at INTEGER NOT NULL,
        consumed_at INTEGER
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT NOT NULL,
        kind TEXT NOT NULL,
        at INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
    )
`)

db.run(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
`)

db.run('CREATE INDEX IF NOT EXISTS idx_attempts_ip_at ON attempts (ip, kind, at)')
db.run('CREATE INDEX IF NOT EXISTS idx_messages_delivered ON messages (delivered)')

export function getSetting(key: string): string | null {
    const row = db.query('SELECT value FROM settings WHERE key = ?').get(key) as
        | { value: string }
        | null
    return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
    db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value],
    )
}

/** Чистка протухших challenge и старых записей о попытках */
export function cleanup(): void {
    const now = Date.now()
    db.run('DELETE FROM challenges WHERE issued_at < ?', [now - 60 * 60 * 1000])
    db.run('DELETE FROM attempts WHERE at < ?', [now - 25 * 60 * 60 * 1000])
}
