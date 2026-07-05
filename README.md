# aaaver.ru

Мой сайт-портфолио. React SPA плюс маленький сервер на Bun, который раздаёт
статику, принимает сообщения с формы и пересылает их мне в Telegram.
Сообщения дублируются в SQLite, так что даже если Telegram лежит — ничего
не теряется.

Стек: React 19, TypeScript, Vite 7, Tailwind 4, Motion. Бэкенд — чистый
`Bun.serve` без единой npm-зависимости, база — `bun:sqlite`. Структура
фронтенда — FSD (`app / pages / widgets / features / entities / shared`).

## Запуск локально

Нужен [Bun](https://bun.sh) 1.3+.

```sh
bun install
cp .env.example .env   # вписать TELEGRAM_BOT_TOKEN
bun dev                # vite на :5173, api на :3001
```

Прод-вариант без докера:

```sh
bun run build
bun run start          # отдаёт dist/ и api на :3000
```

Проверить, что api живой:

```sh
bun scripts/smoke-test.ts http://localhost:3001
```

## Telegram

Форма шлёт сообщения через бота. Что нужно:

1. Токен бота положить в `.env` → `TELEGRAM_BOT_TOKEN`.
2. Написать боту `/start` — без этого Telegram не даёт боту писать первым.
3. Узнать свой chat_id: `bun run chat-id` и вписать в `TELEGRAM_CHAT_ID`.

Третий шаг можно пропустить: если `TELEGRAM_CHAT_ID` пуст, сервер сам
достанет chat_id из `getUpdates` при первой отправке и запомнит его в БД.

## Докер

```sh
cp .env.example .env   # токен бота обязателен
docker compose up --build -d
```

Сайт поднимется на `:6110`. База лежит на хосте в `./data/aaaver.db` —
её можно копировать, скачивать и подменять, контейнер для этого
пересобирать не нужно. Бэкап одной строкой:

```sh
sqlite3 data/aaaver.db ".backup data/backup-$(date +%F).db"
```

Деплой на VDS сводится к `git pull && docker compose up --build -d`
(на винде есть `deploy.bat`, который делает это по ssh).

## Демки проектов

Каталог `sites/` монтируется в контейнер с хоста: положил в
`sites/poopseek/` собранный dist чужого проекта — получил независимый
сайт на `/poopseek/`, без пересборки и рестарта. Заливается одной
командой: `deploy-site.bat poopseek E:\путь\к\dist`. Детали и правила
сборки демок — в [docs/deploy.md](docs/deploy.md).

## Анти-спам в форме

Вместо капчи с картинками — три уровня защиты: невидимый proof-of-work
(браузер решает криптозадачу, пока человек печатает), ползунок
slide-to-send вместо кнопки и honeypot-поле. Плюс лимиты по IP на сервере.
Подробности в [docs/anti-spam.md](docs/anti-spam.md).

## Документация

- [docs/architecture.md](docs/architecture.md) — как устроен код
- [docs/api.md](docs/api.md) — эндпоинты сервера
- [docs/anti-spam.md](docs/anti-spam.md) — защита формы и её настройка
- [docs/deploy.md](docs/deploy.md) — деплой на VDS, nginx, бэкапы
- [docs/content.md](docs/content.md) — где менять тексты и проекты

## Переменные окружения

| Переменная            | Зачем                                            | По умолчанию      |
| --------------------- | ------------------------------------------------ | ----------------- |
| `PORT`                | порт сервера                                     | `3000`            |
| `DATABASE_PATH`       | путь к файлу SQLite                              | `./data/aaaver.db` |
| `SITES_DIR`           | каталог с демками (`<slug>/` → роут `/<slug>/`)  | `./sites`         |
| `TELEGRAM_BOT_TOKEN`  | токен бота                                       | —                 |
| `TELEGRAM_CHAT_ID`    | кому слать (можно не задавать, см. выше)         | автоопределение   |
| `POW_DIFFICULTY`      | сложность proof-of-work в битах                  | `14`              |
| `RATE_LIMIT_PER_HOUR` | сообщений с одного IP в час                      | `5`               |
| `RATE_LIMIT_PER_DAY`  | сообщений с одного IP в сутки                    | `20`              |
| `TRUST_PROXY`         | `1`, если сервер за nginx/caddy                  | `0`               |
