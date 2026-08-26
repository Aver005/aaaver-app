/**
 * Страницы отказа для админки.
 *
 * HTML, а не JSON, потому что сюда приходят НАВИГАЦИЕЙ БРАУЗЕРА: человек нажал
 * «Войти через панель» и смотрит на страницу. `{"error":"bad_request"}` в
 * такой момент — это белый экран с фигурными скобками вместо объяснения.
 *
 * Разметка нарочно голая и не тащит сборку фронтенда: страница живёт секунды,
 * а вторая точка входа во фронтенд ради экрана-заглушки — плохой обмен.
 */
function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

export function renderNotice(input: { title: string; detail: string; backTo?: string }): string {
    const title = escapeHtml(input.title)
    const detail = escapeHtml(input.detail)
    const back = input.backTo
        ? `<p class="back"><a href="${escapeHtml(input.backTo)}">Вернуться</a></p>`
        : ''

    return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
body{margin:0;min-height:100svh;display:flex;align-items:center;justify-content:center;background:#0c0a09;color:#ece7df;font:16px/1.6 system-ui,sans-serif}
main{max-width:32rem;padding:2rem}
h1{margin:0 0 .5rem;font-size:1.15rem;font-weight:600}
p{margin:0;color:#a89f92}
.back{margin-top:1.5rem}
a{color:#ff5d1f}
</style>
</head>
<body>
<main>
<h1>${title}</h1>
<p>${detail}</p>
${back}
</main>
</body>
</html>`
}

export function noticeResponse(
    status: number,
    input: { title: string; detail: string; backTo?: string },
    headers: Record<string, string> = {},
): Response {
    return new Response(renderNotice(input), {
        status,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
    })
}
