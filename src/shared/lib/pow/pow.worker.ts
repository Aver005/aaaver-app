// Решает proof-of-work: ищет nonce, при котором sha256(`${salt}:${nonce}`)
// начинается с difficulty нулевых бит. При сложности 14 это ~16k хешей,
// на телефоне укладывается в доли секунды.

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

self.onmessage = async (e: MessageEvent<{ salt: string; difficulty: number }>) => {
    const { salt, difficulty } = e.data
    let nonce = Math.floor(Math.random() * 1_000_000)
    const started = performance.now()

    for (;;) {
        const data = encoder.encode(`${salt}:${nonce}`)
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))
        if (leadingZeroBits(hash) >= difficulty) {
            self.postMessage({ nonce, tookMs: Math.round(performance.now() - started) })
            return
        }
        nonce++
    }
}
