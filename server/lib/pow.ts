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

/** Проверяет решение proof-of-work: sha256(`${salt}:${nonce}`) начинается с difficulty нулевых бит */
export function verifyPow(salt: string, nonce: number, difficulty: number): boolean {
    if (!Number.isInteger(nonce) || nonce < 0) return false
    const hash = new Bun.CryptoHasher('sha256').update(`${salt}:${nonce}`).digest()
    return leadingZeroBits(new Uint8Array(hash)) >= difficulty
}

export function randomSalt(): string {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
