/**
 * Сообщает поисковикам IndexNow (Яндекс, Bing и др.), что сайт обновился:
 * переобход за часы вместо недель. Google в IndexNow не участвует.
 *
 * Берёт URL из живого sitemap.xml, а не из сборки, — отправляется только то,
 * что реально отдаётся. Запускается шагом деплоя после проверки здоровья:
 *
 *   bun scripts/indexnow.ts
 *
 * Ключ сгенерирован один раз и лежит в public/<ключ>.txt; менять его незачем.
 */
const ORIGIN = process.env.INDEXNOW_ORIGIN ?? 'https://aaaver.ru'
const KEY = '76b5e4e8990f79f9f335cf3d29272b85'

const host = new URL(ORIGIN).host
const keyLocation = `${ORIGIN}/${KEY}.txt`

async function fetchWithRetry(url: string, attempts = 10): Promise<Response> {
    for (let i = 1; ; i++) {
        const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } })
        if (res.ok || i === attempts) return res
        await Bun.sleep(15_000)
    }
}

const keyRes = await fetchWithRetry(keyLocation)
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    console.error(`[indexnow] ключ не отдаётся по ${keyLocation} (${keyRes.status}) — не отправляю`)
    process.exit(1)
}

const sitemap = await (await fetchWithRetry(`${ORIGIN}/sitemap.xml`)).text()
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (!urlList.length) {
    console.error('[indexnow] в sitemap нет <loc> — не отправляю')
    process.exit(1)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation, urlList }),
})
console.log(`[indexnow] ${res.status} ${res.statusText}, адресов: ${urlList.length}`)
// 200 и 202 — принято; остальное пусть будет видно в CI
if (res.status !== 200 && res.status !== 202) process.exit(1)

export {}
