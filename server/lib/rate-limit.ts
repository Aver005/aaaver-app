import { db } from '../db'

type AttemptKind = 'contact' | 'challenge'

function countSince(ip: string, kind: AttemptKind, sinceMs: number): number {
    const row = db
        .query('SELECT COUNT(*) AS n FROM attempts WHERE ip = ? AND kind = ? AND at > ?')
        .get(ip, kind, Date.now() - sinceMs) as { n: number }
    return row.n
}

export function registerAttempt(ip: string, kind: AttemptKind): void {
    db.run('INSERT INTO attempts (ip, kind, at) VALUES (?, ?, ?)', [ip, kind, Date.now()])
}

export function isRateLimited(
    ip: string,
    kind: AttemptKind,
    perHour: number,
    perDay?: number,
): boolean {
    if (countSince(ip, kind, 60 * 60 * 1000) >= perHour) return true
    if (perDay !== undefined && countSince(ip, kind, 24 * 60 * 60 * 1000) >= perDay) return true
    return false
}
