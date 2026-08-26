import { config } from '../config'
import { requireDb, sql } from '../db'
import { randomSalt } from '../lib/pow'
import { getClientIp, json, type BunServer } from '../lib/http'
import { isRateLimited, registerAttempt } from '../lib/rate-limit'

/** POST /api/challenge — выдаёт задачу proof-of-work для формы */
export async function handleChallenge(req: Request, server: BunServer): Promise<Response> {
    requireDb()
    const ip = getClientIp(req, server)

    if (await isRateLimited(ip, 'challenge', config.challengesPerHour)) {
        return json({ error: 'rate-limit' }, 429)
    }
    await registerAttempt(ip, 'challenge')

    const id = crypto.randomUUID()
    const salt = randomSalt()

    // `issued_at` ставит Postgres: часы сервера приложения и базы могут
    // разойтись, а сравнивать это время потом будет тоже база.
    const [row] = await sql`
        INSERT INTO challenges (id, salt, difficulty, ip)
        VALUES (${id}, ${salt}, ${config.powDifficulty}, ${ip})
        RETURNING issued_at
    `
    const issuedAt = row!.issued_at as Date

    return json({
        id,
        salt,
        difficulty: config.powDifficulty,
        expiresAt: issuedAt.getTime() + config.challengeTtlMs,
    })
}
