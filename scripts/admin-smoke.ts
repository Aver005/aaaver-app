/**
 * Прогон входа в админку против работающего сервера:
 *
 *   SSO_CLIENT_SECRET=... ADMIN_EMAILS=... bun scripts/admin-smoke.ts [адрес] [--write]
 *
 * Скрипт подписывает утверждение тем же секретом, что и панель, и проходит
 * весь обмен: уход в панель → возврат формой → сессия → выход. Плюс девять
 * способов НЕ пройти: чужая подпись, чужой `iss`, чужой `aud`, просроченный
 * токен, несовпавший `state`, отсутствие cookie, повтор того же токена,
 * почта не из списка, чужой `Origin` на выходе.
 *
 * Ничего не обходит: сервер проверяет всё то же, что и при настоящем входе.
 * Секрет здесь нужен ровно потому, что он и есть ключ подписи, — у кого он
 * есть, тот и так может выдать себе утверждение о ком угодно.
 *
 * ВАЖНО: `ADMIN_EMAILS` должен совпадать с тем, что задан серверу, иначе
 * удачный вход не удастся и половина проверок покажет ложную поломку.
 *
 * `--write` добавляет проверки реестра: заводит временный слаг, правит его,
 * замораживает и убирает за собой. По умолчанию выключено намеренно — прогон
 * против живого сайта не должен ничего менять просто потому, что его
 * запустили посмотреть.
 */
export {}

const args = process.argv.slice(2)
const base = args.find((arg) => !arg.startsWith('--')) ?? 'http://localhost:3001'
const withWrites = args.includes('--write')
const secret = process.env.SSO_CLIENT_SECRET ?? ''
const allowed = (process.env.ADMIN_EMAILS ?? '').split(',')[0]?.trim() ?? ''
const issuer = process.env.SSO_ISSUER ?? 'https://root.kiviuly.ru'
const clientId = process.env.SSO_CLIENT_ID ?? 'aaaver-admin'

if (!secret || !allowed) {
    console.error('Нужны SSO_CLIENT_SECRET и ADMIN_EMAILS — те же, что у сервера.')
    process.exit(1)
}

let failed = 0
function check(name: string, ok: boolean, extra = '') {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? ` — ${extra}` : ''}`)
    if (!ok) failed++
}

// --- подпись: тот же формат, что у панели (HS256, ключ — байты строки секрета) ---

function base64url(bytes: Uint8Array): string {
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

const encoder = new TextEncoder()

async function sign(payload: Record<string, unknown>, key: string): Promise<string> {
    const input = `${base64url(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))}.${base64url(
        encoder.encode(JSON.stringify(payload)),
    )}`
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(input))
    return `${input}.${base64url(new Uint8Array(signature))}`
}

function claims(over: Record<string, unknown> = {}) {
    const now = Math.floor(Date.now() / 1000)
    return {
        iss: issuer,
        aud: clientId,
        sub: 'smoke-test-user',
        email: allowed,
        name: 'Смоук Тест',
        iat: now,
        exp: now + 60,
        jti: crypto.randomUUID(),
        state: '',
        ...over,
    }
}

function cookieFrom(res: Response, name: string): string | null {
    for (const raw of res.headers.getSetCookie()) {
        const pair = raw.split(';')[0] ?? ''
        const eq = pair.indexOf('=')
        if (pair.slice(0, eq) !== name) continue
        const value = pair.slice(eq + 1)
        return value === '' ? null : decodeURIComponent(value)
    }
    return null
}

async function callback(idToken: string, state: string, cookieState: string | null): Promise<Response> {
    return fetch(`${base}/api/admin/sso/callback`, {
        method: 'POST',
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(cookieState ? { Cookie: `admin_sso_state=${encodeURIComponent(cookieState)}` } : {}),
        },
        body: new URLSearchParams({ id_token: idToken, state }),
    })
}

// --- 1. уход в панель ---

const login = await fetch(`${base}/api/admin/login`, { redirect: 'manual' })
check('GET /api/admin/login отвечает 302', login.status === 302, String(login.status))

const state = cookieFrom(login, 'admin_sso_state')
check('выдана cookie state', !!state)

const stateCookie = login.headers.getSetCookie().find((c) => c.startsWith('admin_sso_state')) ?? ''
// Самая важная строка обмена: при Lax браузер не пришлёт cookie в
// кросс-сайтовом POST-е, и сверять state будет не с чем.
check('state-cookie SameSite=None + Secure + HttpOnly',
    stateCookie.includes('SameSite=None') && stateCookie.includes('Secure') && stateCookie.includes('HttpOnly'),
    stateCookie.split(';').slice(1).join(';').trim())

const target = new URL(login.headers.get('location') ?? 'http://invalid')
check('уводит на authorize панели', `${target.origin}${target.pathname}` === `${issuer}/api/sso/authorize`, target.toString())
check('state в адресе совпадает с cookie', target.searchParams.get('state') === state)

// --- 2. девять способов не пройти ---

const good = () => claims({ state: state ?? '' })

check('без cookie state — отказ', (await callback(await sign(good(), secret), state ?? '', null)).status === 400)
check('state не совпал — отказ', (await callback(await sign(claims({ state: 'чужой' }), secret), 'чужой', state)).status === 400)
check('чужая подпись — отказ', (await callback(await sign(good(), `${secret}x`), state ?? '', state)).status === 400)
check('чужой iss — отказ', (await callback(await sign(claims({ state, iss: 'https://evil.example' }), secret), state ?? '', state)).status === 400)
check('чужой aud — отказ', (await callback(await sign(claims({ state, aud: 'other' }), secret), state ?? '', state)).status === 400)
check('просроченный токен — отказ',
    (await callback(await sign(claims({ state, exp: Math.floor(Date.now() / 1000) - 120 }), secret), state ?? '', state)).status === 400)
check('почта не из списка — 403',
    (await callback(await sign(claims({ state, email: 'nobody@example.com' }), secret), state ?? '', state)).status === 403)

// --- 3. удачный вход ---

const token = await sign(good(), secret)
const entered = await callback(token, state ?? '', state)
check('верный токен — 303 на /admin',
    entered.status === 303 && entered.headers.get('location') === '/admin',
    `${entered.status} ${entered.headers.get('location')}`)

const session = cookieFrom(entered, 'admin_session')
check('выдана сессионная cookie', !!session)

const sessionCookie = entered.headers.getSetCookie().find((c) => c.startsWith('admin_session')) ?? ''
check('сессия SameSite=Lax + Secure + HttpOnly',
    sessionCookie.includes('SameSite=Lax') && sessionCookie.includes('Secure') && sessionCookie.includes('HttpOnly'))

check('повтор того же токена отбит', (await callback(token, state ?? '', state)).status === 400)

// --- 4. работа под сессией ---

const auth = { Cookie: `admin_session=${encodeURIComponent(session ?? '')}` }

const me = await fetch(`${base}/api/admin/me`, { headers: auth })
const meBody = (await me.json()) as { user?: { email?: string } }
check('GET /api/admin/me под сессией', me.status === 200 && meBody.user?.email === allowed, JSON.stringify(meBody))
check('GET /api/admin/me без сессии — 401', (await fetch(`${base}/api/admin/me`)).status === 401)

const sites = await fetch(`${base}/api/admin/sites`, { headers: auth })
const sitesBody = (await sites.json()) as { sites?: Array<{ slug: string }> }
check('GET /api/admin/sites под сессией', sites.status === 200 && Array.isArray(sitesBody.sites),
    (sitesBody.sites ?? []).map((s) => s.slug).join(', ') || 'демок нет')
check('GET /api/admin/sites без сессии — 401', (await fetch(`${base}/api/admin/sites`)).status === 401)

check('POST /api/admin/logout с чужим Origin — 403',
    (await fetch(`${base}/api/admin/logout`, { method: 'POST', headers: { ...auth, Origin: 'https://evil.example' } })).status === 403)

// --- 5. реестр ---

interface AdminSite {
    slug: string
    title: string
    status: string
    source: { provider: string; repo: string; tag: string; enabled: boolean } | null
    deployed: { bytes: number } | null
}

async function registry(): Promise<AdminSite[]> {
    const res = await fetch(`${base}/api/admin/sites`, { headers: auth })
    const body = (await res.json()) as { sites?: AdminSite[] }
    return body.sites ?? []
}

const listed = await registry()
check('в реестре есть записи', listed.some((site) => site.source !== null),
    listed.map((s) => `${s.slug}:${s.status}`).join(' '))
check('у развёрнутых демок виден и источник, и диск',
    listed.filter((s) => s.status === 'live').every((s) => s.source !== null && s.deployed !== null))

const json = { 'Content-Type': 'application/json', ...auth }
const TEMP = 'smoke-tmp-registry'

const badSlug = await fetch(`${base}/api/admin/sites`, {
    method: 'POST', headers: json,
    body: JSON.stringify({ slug: 'admin', provider: 'github', repo: 'a/b' }),
})
check('забронированный слаг «admin» отвергнут', badSlug.status === 400, String(badSlug.status))

const badRepo = await fetch(`${base}/api/admin/sites`, {
    method: 'POST', headers: json,
    body: JSON.stringify({ slug: TEMP, provider: 'github', repo: 'https://github.com/a/b' }),
})
check('репозиторий со схемой отвергнут', badRepo.status === 400, String(badRepo.status))

if (!withWrites) {
    console.log('\n(проверки записи в реестр пропущены — добавьте --write)')
} else {
    try {
        const created = await fetch(`${base}/api/admin/sites`, {
            method: 'POST', headers: json,
            body: JSON.stringify({ slug: TEMP, title: 'Временный', provider: 'github', repo: 'Aver005/nope' }),
        })
        check('сайт заведён — 201', created.status === 201, String(created.status))

        const dup = await fetch(`${base}/api/admin/sites`, {
            method: 'POST', headers: json,
            body: JSON.stringify({ slug: TEMP, provider: 'github', repo: 'Aver005/nope' }),
        })
        check('повторный слаг — 409', dup.status === 409, String(dup.status))

        const afterCreate = (await registry()).find((s) => s.slug === TEMP)
        check('новый сайт в состоянии «ждёт»', afterCreate?.status === 'pending', afterCreate?.status)

        const patched = await fetch(`${base}/api/admin/sites/${TEMP}`, {
            method: 'PATCH', headers: json,
            body: JSON.stringify({ repo: 'Aver005/other', tag: 'v1' }),
        })
        check('правка — 200', patched.status === 200, String(patched.status))
        const afterPatch = (await registry()).find((s) => s.slug === TEMP)
        check('правка доехала', afterPatch?.source?.repo === 'Aver005/other' && afterPatch?.source?.tag === 'v1',
            `${afterPatch?.source?.repo} @${afterPatch?.source?.tag}`)

        await fetch(`${base}/api/admin/sites/${TEMP}`, {
            method: 'PATCH', headers: json, body: JSON.stringify({ enabled: false }),
        })
        const frozen = (await registry()).find((s) => s.slug === TEMP)
        check('заморозка снимает enabled', frozen?.source?.enabled === false)

        const nope = await fetch(`${base}/api/admin/sites/net-takogo-slaga`, { method: 'DELETE', headers: auth })
        check('удаление несуществующего — 404', nope.status === 404, String(nope.status))
    } finally {
        const removed = await fetch(`${base}/api/admin/sites/${TEMP}`, { method: 'DELETE', headers: auth })
        check('временный сайт убран из реестра', removed.status === 200, String(removed.status))
        check('его больше нет в списке', !(await registry()).some((s) => s.slug === TEMP))
    }
}

// --- 6. выход ---

check('POST /api/admin/logout — 200', (await fetch(`${base}/api/admin/logout`, { method: 'POST', headers: auth })).status === 200)
check('сессия после выхода недействительна', (await fetch(`${base}/api/admin/me`, { headers: auth })).status === 401)

console.log(failed === 0 ? '\nВсё зелёное.' : `\nПровалено проверок: ${failed}`)
process.exit(failed === 0 ? 0 : 1)
