# API

Все эндпоинты живут под `/api/`, остальные пути отдают SPA.

## GET /api/health

Проверка живости — используется docker healthcheck'ом.

```json
{ "ok": true }
```

## POST /api/challenge

Выдаёт proof-of-work задачу для формы. Лимит: 30 в час с IP.

Ответ `200`:

```json
{
  "id": "uuid",
  "salt": "hex-строка",
  "difficulty": 14,
  "expiresAt": 1765432100000
}
```

`429 { "error": "rate-limit" }` — слишком часто.

## POST /api/contact

Приём сообщения с формы.

Тело:

```json
{
  "challengeId": "uuid из /api/challenge",
  "nonce": 12345,
  "name": "2-100 символов",
  "contact": "3-150 символов",
  "message": "10-4000 символов",
  "website": "",
  "gesture": { "durationMs": 640, "samples": 42, "distance": 380 },
  "elapsedMs": 4200,
  "locale": "ru"
}
```

`nonce` — решение pow: `sha256(salt + ":" + nonce)` должен начинаться
с `difficulty` нулевых бит. `website` — honeypot, должен оставаться
пустым. `gesture` — статистика жеста слайдера (мягкий сигнал, не блокирует).

Ответы:

| Код | Тело                          | Когда                                          |
| --- | ----------------------------- | ---------------------------------------------- |
| 200 | `{ "ok": true }`              | принято (и отправлено или поставлено в очередь) |
| 400 | `{ "error": "validation" }`   | поля не проходят по длине / битый JSON          |
| 403 | `{ "error": "captcha" }`      | challenge не найден/использован/протух, неверный nonce, слишком быстрая отправка |
| 429 | `{ "error": "rate-limit" }`   | превышены лимиты с IP                           |

## GET /api/github/repos

Список публичных репозиториев (не форки, без самого сайта), максимум 12,
отсортированы по дате пуша. Кэшируется в SQLite на 6 часов; если GitHub
недоступен — отдаётся протухший кэш.

```json
[
  {
    "name": "poopseek",
    "url": "https://github.com/Aver005/poopseek",
    "description": "…",
    "language": "TypeScript",
    "stars": 1,
    "topics": ["agent", "ai"],
    "pushedAt": "2026-05-22T16:35:33Z"
  }
]
```

`502 { "error": "github-unavailable" }` — GitHub лежит и кэша ещё нет
(фронт в этом случае показывает встроенный снимок).
