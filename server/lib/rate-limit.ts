import { sql } from '../db'

type AttemptKind = 'contact' | 'challenge'

/**
 * `count(*)::int`, а не голый `count(*)`.
 *
 * Postgres отдаёт bigint СТРОКОЙ — «12», а не 12. Само сравнение с числом
 * ещё сработало бы (JS привёл бы строку к числу), но в типах у нас стоял бы
 * `number`, в котором лежит строка, и первая же арифметика над ним превратила
 * бы сложение в склейку. Приведение в SQL убирает ложь в типе там, где она
 * возникает.
 */
async function countSince(ip: string, kind: AttemptKind, window: string): Promise<number> {
    const [row] = await sql`
        SELECT count(*)::int AS n
        FROM attempts
        WHERE ip = ${ip} AND kind = ${kind} AND at > now() - ${window}::interval
    `
    return (row?.n as number | undefined) ?? 0
}

export async function registerAttempt(ip: string, kind: AttemptKind): Promise<void> {
    await sql`INSERT INTO attempts (ip, kind) VALUES (${ip}, ${kind})`
}

export async function isRateLimited(
    ip: string,
    kind: AttemptKind,
    perHour: number,
    perDay?: number,
): Promise<boolean> {
    if ((await countSince(ip, kind, '1 hour')) >= perHour) return true
    if (perDay !== undefined && (await countSince(ip, kind, '24 hours')) >= perDay) return true
    return false
}
