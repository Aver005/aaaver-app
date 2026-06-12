import { config } from '../config'
import { db } from '../db'
import { randomSalt } from '../lib/pow'
import { getClientIp, json, type BunServer } from '../lib/http'
import { isRateLimited, registerAttempt } from '../lib/rate-limit'

/** POST /api/challenge — выдаёт задачу proof-of-work для формы */
export function handleChallenge(req: Request, server: BunServer): Response {
    const ip = getClientIp(req, server)

    if (isRateLimited(ip, 'challenge', config.challengesPerHour)) {
        return json({ error: 'rate-limit' }, 429)
    }
    registerAttempt(ip, 'challenge')

    const id = crypto.randomUUID()
    const salt = randomSalt()
    const issuedAt = Date.now()

    db.run('INSERT INTO challenges (id, salt, difficulty, ip, issued_at) VALUES (?, ?, ?, ?, ?)', [
        id,
        salt,
        config.powDifficulty,
        ip,
        issuedAt,
    ])

    return json({
        id,
        salt,
        difficulty: config.powDifficulty,
        expiresAt: issuedAt + config.challengeTtlMs,
    })
}
