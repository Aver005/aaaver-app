export interface PowChallenge {
    id: string
    salt: string
    difficulty: number
    expiresAt: number
}

export interface GestureStats {
    durationMs: number
    samples: number
    distance: number
}

export interface ContactPayload {
    challengeId: string
    nonce: number
    name: string
    contact: string
    message: string
    website: string // honeypot, всегда пустой у людей
    gesture: GestureStats
    elapsedMs: number
    locale: string
}

export type ContactResult =
    | { ok: true }
    | { ok: false; error: 'rate-limit' | 'captcha' | 'validation' | 'server' }

export interface RepoInfo {
    name: string
    url: string
    description: string | null
    language: string | null
    stars: number
    topics: string[]
    pushedAt: string
}

export async function fetchChallenge(): Promise<PowChallenge> {
    const res = await fetch('/api/challenge', { method: 'POST' })
    if (!res.ok) throw new Error(`challenge ${res.status}`)
    return res.json()
}

export async function sendContact(payload: ContactPayload): Promise<ContactResult> {
    let res: Response
    try {
        res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    } catch {
        return { ok: false, error: 'server' }
    }

    if (res.ok) return { ok: true }
    if (res.status === 429) return { ok: false, error: 'rate-limit' }
    if (res.status === 403) return { ok: false, error: 'captcha' }
    if (res.status === 400) return { ok: false, error: 'validation' }
    return { ok: false, error: 'server' }
}

export async function fetchRepos(): Promise<RepoInfo[]> {
    const res = await fetch('/api/github/repos')
    if (!res.ok) throw new Error(`repos ${res.status}`)
    return res.json()
}
