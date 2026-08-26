/**
 * Проверка JWT на HS256 — своими руками, без библиотеки.
 *
 * Здесь нужен ровно один алгоритм: посчитать HMAC-SHA256 по двум склеенным
 * кускам base64url. Это умеет `crypto.subtle`, а библиотека принесла бы с
 * собой полтора десятка алгоритмов, JWK, JWE и разбор `alg` из заголовка —
 * то есть ровно ту поверхность, из-за которой у JWT дурная слава. Заодно
 * сохраняется свойство сервера: ноль npm-зависимостей.
 *
 * Только проверка. Подписывать нам нечего: токены выдаёт панель, а своя
 * сессия — это случайная строка в базе, ей подпись не нужна.
 *
 * Формат обязан совпадать с тем, что выдаёт панель (`domain/jwt.ts` в
 * dashboard): ключ HMAC — это БАЙТЫ САМОЙ СТРОКИ секрета в UTF-8, а не её
 * base64-разбор. Секрет там генерируется как base64url от 32 байт, и соблазн
 * «раскодировать обратно» тут заканчивается несходящейся подписью.
 */
const encoder = new TextEncoder()
const decoder = new TextDecoder()

const ALG = 'HS256'

export type JwtVerdict =
    | { ok: true; payload: Record<string, unknown> }
    /**
     * Причина машинная: наружу все отказы выглядят одинаково, а в журнал
     * писать надо разное — «просрочен» и «подпись не сошлась» это совершенно
     * разные события.
     */
    | { ok: false; reason: 'malformed' | 'unsupported-alg' | 'bad-signature' }

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
    // Выравнивание возвращается на место: без него `atob` не работает.
    const padded = value
        .replaceAll('-', '+')
        .replaceAll('_', '/')
        .padEnd(value.length + ((4 - (value.length % 4)) % 4), '=')

    try {
        const binary = atob(padded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return bytes
    } catch {
        return null
    }
}

/**
 * Проверяет подпись и возвращает нагрузку.
 *
 * Срок жизни здесь НЕ проверяется: это дело вызывающего, потому что вместе с
 * `exp` он обязан сверить ещё `iss`, `aud` и `state`, и разносить эти проверки
 * по двум файлам — верный способ однажды забыть половину.
 */
export async function verifyHs256(token: string, secret: string): Promise<JwtVerdict> {
    const parts = token.split('.')
    if (parts.length !== 3) return { ok: false, reason: 'malformed' }

    const [rawHeader, rawPayload, rawSignature] = parts as [string, string, string]

    const headerBytes = decodeBase64Url(rawHeader)
    const payloadBytes = decodeBase64Url(rawPayload)
    const signatureBytes = decodeBase64Url(rawSignature)
    if (!headerBytes || !payloadBytes || !signatureBytes) return { ok: false, reason: 'malformed' }

    let header: unknown
    let payload: unknown
    try {
        header = JSON.parse(decoder.decode(headerBytes))
        payload = JSON.parse(decoder.decode(payloadBytes))
    } catch {
        return { ok: false, reason: 'malformed' }
    }

    if (typeof payload !== 'object' || payload === null) return { ok: false, reason: 'malformed' }

    /**
     * `alg` СВЕРЯЕТСЯ, А НЕ ВЫБИРАЕТ АЛГОРИТМ.
     *
     * Классическая дыра всех разборщиков JWT — довериться заголовку и
     * проверить тем, что в нём написано: тогда `{"alg":"none"}` проходит без
     * подписи вовсе. Здесь алгоритм зашит, а заголовок — просто ещё одно
     * поле, которое обязано совпасть.
     */
    if ((header as { alg?: unknown }).alg !== ALG) return { ok: false, reason: 'unsupported-alg' }

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify'],
    )
    const valid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        encoder.encode(`${rawHeader}.${rawPayload}`),
    )
    if (!valid) return { ok: false, reason: 'bad-signature' }

    return { ok: true, payload: payload as Record<string, unknown> }
}
