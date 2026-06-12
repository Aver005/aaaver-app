/**
 * Прогон контактного флоу против работающего сервера:
 *   bun scripts/smoke-test.ts [http://localhost:3001]
 *
 * Проверяет: health, выдачу challenge, решение proof-of-work,
 * успешную отправку, повторное использование challenge (должно падать)
 * и слишком быструю отправку (тоже должна падать).
 */
export {}

const base = process.argv[2] ?? 'http://localhost:3001'
let failed = 0

function check(name: string, ok: boolean, extra = '') {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`)
    if (!ok) failed++
}

function leadingZeroBits(bytes: Uint8Array): number {
    let bits = 0
    for (const byte of bytes) {
        if (byte === 0) {
            bits += 8
            continue
        }
        let mask = 0x80
        while (mask > 0 && (byte & mask) === 0) {
            bits++
            mask >>= 1
        }
        break
    }
    return bits
}

function solve(salt: string, difficulty: number): number {
    let nonce = 0
    for (;;) {
        const hash = new Bun.CryptoHasher('sha256').update(`${salt}:${nonce}`).digest()
        if (leadingZeroBits(new Uint8Array(hash)) >= difficulty) return nonce
        nonce++
    }
}

async function getChallenge() {
    const res = await fetch(`${base}/api/challenge`, { method: 'POST' })
    return (await res.json()) as { id: string; salt: string; difficulty: number }
}

function contactPayload(challengeId: string, nonce: number) {
    return {
        challengeId,
        nonce,
        name: 'Смоук Тест',
        contact: '@smoke_test',
        message: 'Проверочное сообщение от scripts/smoke-test.ts — можно игнорировать.',
        website: '',
        gesture: { durationMs: 640, samples: 42, distance: 380 },
        elapsedMs: 4200,
        locale: 'ru',
    }
}

async function postContact(payload: unknown) {
    return fetch(`${base}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
}

// 1. health
const health = await fetch(`${base}/api/health`)
check('GET /api/health', health.ok)

// 2. challenge + pow
const challenge = await getChallenge()
check('POST /api/challenge', Boolean(challenge.id && challenge.salt))
const started = performance.now()
const nonce = solve(challenge.salt, challenge.difficulty)
check('pow решён', true, `difficulty ${challenge.difficulty}, ${Math.round(performance.now() - started)}ms`)

// 3. слишком быстрая отправка — сервер должен отказать
const tooFast = await postContact(contactPayload(challenge.id, nonce))
check('мгновенная отправка отклонена (403)', tooFast.status === 403, `status ${tooFast.status}`)

// 4. честная отправка: новый challenge, ждём минимальную задержку
const challenge2 = await getChallenge()
const nonce2 = solve(challenge2.salt, challenge2.difficulty)
await Bun.sleep(2200)
const sent = await postContact(contactPayload(challenge2.id, nonce2))
check('валидная отправка принята (200)', sent.status === 200, `status ${sent.status}`)

// 5. повторное использование challenge — отказ
const replay = await postContact(contactPayload(challenge2.id, nonce2))
check('повтор challenge отклонён (403)', replay.status === 403, `status ${replay.status}`)

// 6. неверный nonce — отказ
const challenge3 = await getChallenge()
await Bun.sleep(2200)
const badNonce = await postContact(contactPayload(challenge3.id, 1))
check('неверный nonce отклонён (403)', badNonce.status === 403, `status ${badNonce.status}`)

// 7. github-прокси
const repos = await fetch(`${base}/api/github/repos`)
check('GET /api/github/repos', repos.ok, `status ${repos.status}`)

console.log(failed === 0 ? '\nВсё зелёное.' : `\nПровалено проверок: ${failed}`)
process.exit(failed === 0 ? 0 : 1)
