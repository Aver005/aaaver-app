# Архитектура

Проект состоит из двух частей, живущих в одном репозитории:

- `src/` — React SPA, собирается vite'ом в `dist/`;
- `server/` — сервер на Bun: раздаёт `dist/`, держит API и SQLite.

В проде работает один процесс (`bun server/index.ts`), в деве два:
vite dev-сервер на :5173 проксирует `/api` на bun-сервер на :3001
(см. `scripts/dev.ts` — он поднимает оба).

## Фронтенд: FSD

Классические слои Feature-Sliced Design, импорты только сверху вниз:

```
app/        точка входа, провайдеры, глобальные стили и токены темы
pages/      home — композиция виджетов
widgets/    navbar, hero, about, experience, projects, open-source,
            stack, contact, footer
features/   contact-form (форма + slide-to-send + pow),
            locale-switch (RU/EN)
entities/   project, experience, skill, repo — типы, данные, карточки
shared/     ui-кит, i18n, api-клиент, pow-солвер, конфиг
```

Правило простое: виджет может импортировать фичи/сущности/shared,
фича — сущности/shared, сущность — только shared. Внутри слайса наружу
торчит только `index.ts`.

### Контент

Весь контент — статика в коде, БД для него не нужна:

- тексты интерфейса: `shared/i18n/dict.ts` (словарь RU/EN);
- проекты, опыт, стек: `entities/*/model/data.ts` с двуязычными полями.

Исключение — секция Open Source: она тянет живые данные с GitHub через
серверный кэш (`/api/github/repos`), а на время загрузки/при ошибке
показывает снимок из `entities/repo/model/fallback.ts`.

### Локализация

Без библиотек: словарь + React-контекст (`shared/i18n`). Язык определяется
по `navigator.language`, выбор запоминается в localStorage. Контентные
строки в entities хранятся как `{ ru, en }`, достаются хелпером `lx()`.

## Сервер

Чистый `Bun.serve` с маршрутами, ни одной npm-зависимости — обновлять
и чинить нечего, рантайм-уязвимостям взяться неоткуда.

```
server/
  index.ts        Bun.serve: роуты + статика + фоновые задачи
  config.ts       все env-переменные в одном месте
  db.ts           bun:sqlite, схема, WAL
  lib/
    pow.ts        проверка proof-of-work
    rate-limit.ts лимиты по IP (таблица attempts)
    telegram.ts   отправка в TG + автопоиск chat_id
    static.ts     раздача dist/ c кэш-заголовками и SPA-фолбэком
    http.ts       json-хелпер, определение IP клиента
  routes/
    challenge.ts  POST /api/challenge
    contact.ts    POST /api/contact + фоновый ретрай недоставленного
    github.ts     GET /api/github/repos с кэшем в SQLite
```

### SQLite

Файл задаётся `DATABASE_PATH`, по умолчанию `./data/aaaver.db`. Включён
WAL — поэтому рядом с файлом появляются `-wal` и `-shm`, это нормально.

Таблицы:

- `messages` — все сообщения с формы: текст, IP, user-agent, флаги спама,
  статус доставки в Telegram;
- `challenges` — выданные pow-задачи (одноразовые, чистятся через час);
- `attempts` — события для rate-limit (чистятся через сутки);
- `settings` — key-value: найденный chat_id, кэш GitHub.

Раз в 10 минут сервер чистит протухшее и пытается дослать в Telegram
сообщения с `delivered = 0` (до 20 попыток на сообщение).

## Docker

Multi-stage: `deps` (bun install) → `build` (vite build) → `runtime`.
В рантайм-образ попадают только `server/` и `dist/` — node_modules там
не нужен, потому что у сервера нет зависимостей. БД монтируется с хоста
(`./data:/data`), подробности в [deploy.md](deploy.md).
