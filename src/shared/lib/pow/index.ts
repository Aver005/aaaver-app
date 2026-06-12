export interface PowSolution {
    nonce: number
    tookMs: number
}

const encoder = new TextEncoder()

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

/** Запасной вариант на главном потоке: digest асинхронный, UI не блокируется */
async function solveInline(salt: string, difficulty: number): Promise<PowSolution> {
    const started = performance.now()
    let nonce = Math.floor(Math.random() * 1_000_000)
    for (;;) {
        const hash = new Uint8Array(
            await crypto.subtle.digest('SHA-256', encoder.encode(`${salt}:${nonce}`)),
        )
        if (leadingZeroBits(hash) >= difficulty) {
            return { nonce, tookMs: Math.round(performance.now() - started) }
        }
        nonce++
    }
}

function solveInWorker(salt: string, difficulty: number): Promise<PowSolution> {
    return new Promise((resolve, reject) => {
        let worker: Worker
        try {
            worker = new Worker(new URL('./pow.worker.ts', import.meta.url), { type: 'module' })
        } catch {
            reject(new Error('worker-unavailable'))
            return
        }

        const timeout = setTimeout(() => {
            worker.terminate()
            reject(new Error('pow-timeout'))
        }, 30_000)

        worker.onmessage = (e: MessageEvent<PowSolution>) => {
            clearTimeout(timeout)
            worker.terminate()
            resolve(e.data)
        }
        worker.onerror = () => {
            clearTimeout(timeout)
            worker.terminate()
            reject(new Error('worker-failed'))
        }

        worker.postMessage({ salt, difficulty })
    })
}

/**
 * Решает proof-of-work: ищет nonce, при котором sha256(`${salt}:${nonce}`)
 * начинается с difficulty нулевых бит. Считает в воркере, при его
 * недоступности — на главном потоке.
 */
export async function solvePow(salt: string, difficulty: number): Promise<PowSolution> {
    try {
        return await solveInWorker(salt, difficulty)
    } catch {
        return solveInline(salt, difficulty)
    }
}
