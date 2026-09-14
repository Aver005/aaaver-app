# Деплой на VDS

Нужны docker и docker compose. Всё остальное соберётся в контейнере.

## Первый запуск

```sh
git clone https://github.com/Aver005/aaaver-app.git
cd aaaver-app
cp .env.example .env
nano .env              # вписать TELEGRAM_BOT_TOKEN
docker compose up --build -d
```

Проверка:

```sh
curl http://localhost:6110/api/health
# {"ok":true}
```

Дальше один раз написать боту `/start` в Telegram — сервер сам найдёт
chat_id и запомнит его. Либо явно: `bun run chat-id` на любой машине
с этим же токеном и вписать число в `TELEGRAM_CHAT_ID`.

## Обновление

```sh
git pull && docker compose up --build -d
```

С локальной машины то же самое делает `deploy.bat` (ssh на сервер,
настройки берёт из `.env`: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`,
`DEPLOY_PATH`, `DEPLOY_COMMAND`).

### Автодеплой при пуше

`.github/workflows/deploy.yml` делает то же самое сам на каждый пуш
в master: typecheck → ssh на VDS → `git pull && docker compose up
--build -d` → ждёт, пока `/api/health` не ответит (иначе валит workflow
и печатает логи контейнера). Одновременные деплои не накладываются —
второй ждёт первого. После успешного деплоя `scripts/indexnow.ts`
отправляет адреса из живого `sitemap.xml` в IndexNow (Яндекс, Bing);
ключ — `public/76b5e4e8990f79f9f335cf3d29272b85.txt`, его не трогать.

Разовая настройка — завести отдельный ключ для деплоя и три секрета:

```sh
# локально или на VDS
ssh-keygen -t ed25519 -f deploy_key -N '' -C 'github-actions deploy'
cat deploy_key.pub >> ~/.ssh/authorized_keys   # на VDS, под деплой-юзером
```

В репе GitHub → Settings → Secrets and variables → Actions:

| Секрет           | Значение                                       |
| ---------------- | ---------------------------------------------- |
| `DEPLOY_HOST`    | ip или домен VDS                               |
| `DEPLOY_USER`    | ssh-пользователь                               |
| `DEPLOY_SSH_KEY` | содержимое приватного `deploy_key` целиком     |
| `DEPLOY_PATH`    | путь к репе на сервере (не нужен, если `aaaver-app`) |

`deploy.bat` при этом никуда не девается — это ручной запасной ход,
когда нужно задеплоить, не пуша.

## База данных

Общий Postgres стека (контейнер `pg`), своя роль и своя база — как у
соседних проектов. Адрес лежит в `.env`:

```
DATABASE_URL=postgres://aaaver:ПАРОЛЬ@pg:5432/aaaverdb?sslmode=require
```

`sslmode=require` обязателен: в `pg_hba` стека стоит `hostssl`. Именно
`require`, а не `verify-full` — сертификат выписан на `db.kiviuly.ru`,
а ходим мы по имени контейнера `pg`. Пароль в URL должен быть
percent-encoded, иначе строка разберётся не так, как выглядит.

Роль и база заводятся один раз из-под суперпользователя:

```sh
docker exec -i pg psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<'SQL'
CREATE ROLE aaaver LOGIN PASSWORD '...';
CREATE DATABASE aaaverdb OWNER aaaver;
SQL
```

Схему накатывает сам сервер при старте — руками ничего применять не надо
(`server/db/migrations/*.sql`, см. [architecture.md](architecture.md)).

Посмотреть сообщения:

```sh
docker exec -it pg psql -U aaaver -d aaaverdb \
  -c 'SELECT id, name, contact, delivered FROM messages ORDER BY id DESC LIMIT 10;'
```

Бэкап и восстановление — обычные `pg_dump` / `pg_restore`; отдельного
ритуала у проекта больше нет, база попадает в общий дамп стека.

### Postgres лежит — сайт работает

`depends_on: postgres` здесь недоступен (Postgres описан в родительском
`/root/compose.yml`, ссылка на чужой сервис ломает compose), поэтому
сервер спроектирован под недоступную базу: статика отдаётся всегда,
запросы к базе отвечают `503 db-unavailable`, а `/api/health` остаётся
200 и говорит правду полем:

```sh
curl -s localhost:6110/api/health
# {"ok":true,"db":true,"dbError":null}
```

Healthcheck докера смотрит на `ok`, а не на `db`: перезапускать контейнер
из-за лежащей базы бессмысленно.

### Переезд со старой SQLite

Разовая операция, нужна только там, где остался `data/aaaver.db`.
Скрипт переносит `messages` и `settings` (протухающие `challenges` и
`attempts` не переносятся намеренно) и сам накатывает схему:

```sh
DATABASE_URL='postgres://aaaver:ПАРОЛЬ@127.0.0.1:5432/aaaverdb?sslmode=require' \
  bun scripts/migrate-sqlite-to-pg.ts
```

Адрес именно `127.0.0.1`: с хоста имя контейнера `pg` не резолвится.
Повторный запуск отказывается работать, если в цели уже есть сообщения,
— чтобы не продублировать переписку.

После проверки `data/` можно удалить: из `docker-compose.yml` этот
том убран, контейнер туда больше не смотрит.

## Статичные демки

Пошаговый чеклист «добавить новый сайтик» — в [new-site.md](new-site.md),
здесь — как это устроено.

Каталог `sites/` на хосте монтируется в контейнер read-only. Каждая
папка `sites/<slug>/` с `index.html` внутри становится роутом
`https://.../<slug>/` — отдельным сайтом, независимым от портфолио.
Обновление демки — просто заменить файлы в папке, контейнер трогать
не нужно.

```sh
mkdir -p aaaver-app/sites/poopseek
# залить туда содержимое dist демки — и всё, /poopseek/ живой
```

С локальной машины это делает `deploy-site.bat`:

```bat
deploy-site.bat poopseek E:\Projects\poopseek\dist
```

Он заливает dist по scp во временную папку и атомарно подменяет старую
версию — демка не ловит полусобранное состояние. Настройки ssh те же,
что у `deploy.bat`.

Два правила для самих демок:

- собирать с `base: '/<slug>/'` в vite-конфиге демки (или `base: './'`,
  если внутри нет клиентского роутера) — иначе она будет искать ассеты
  в корне и промахнётся;
- слаг — строчные латинские буквы, цифры и дефис; имена `api`, `assets`
  и `projects` заняты портфолио.

Список смонтированных демок сервер отдаёт на `GET /api/sites`.

## Автодеплой демок из GitHub/GitLab

Ручной `deploy-site.bat` не обязателен: рядом с сервером крутится
`sites-updater` (второй сервис в compose, тот же образ), который опрашивает
релизы реп из **реестра** и сам обновляет `sites/`.

Реестр — таблица `sites` в базе, правится в панели
(`https://aaaver.ru/admin`, см. [admin.md](admin.md)). Раньше это был
`sites.config.json` в репозитории; файл убран, потому что панель не может
править то, что перезаписывается при `git pull` и при каждой пересборке.

Поля записи: `provider` (`github`/`gitlab`) и `repo` вида `owner/repo` —
обязательные; `asset` — имя файла в релизе (пусто = `dist.tar.gz`); `tag` —
пин на конкретный тег (пусто = тег `latest`, если его нет — последний
релиз); `enabled` — выключенный сайт перестаёт обновляться, но продолжает
раздаваться.

Разделение обязанностей: реестр пишет только панель и только читает
апдейтер; диск, наоборот, пишет только апдейтер — основному серверу
каталог демок смонтирован read-only. Направления не пересекаются.

Как это работает по шагам:

1. CI демки на каждый пуш собирает сайт и кладёт `dist.tar.gz`
   в скользящий релиз `latest` своей репы;
2. апдейтер раз в `SITES_POLL_MINUTES` (по умолчанию 10) сравнивает
   версию релиза с меткой `.release.json` внутри развёрнутой демки;
3. если версия новая — скачивает архив, проверяет его (пути не вылезают
   из папки, в корне есть index.html, размер до 200 МБ), распаковывает
   во временную папку и атомарно подменяет `sites/<slug>/`.

Каталог `sites` смонтирован на запись только апдейтеру, основной сервер
видит его read-only.

Для GitHub-демки достаточно одного файла в её репе — весь пайплайн
переиспользуется из этой репы:

```yaml
# .github/workflows/demo.yml
on: { push: { branches: [master] } }
jobs:
  demo:
    uses: Aver005/aaaver-app/.github/workflows/site-release.yml@master
    permissions: { contents: write }
    # проект не на bun или dist зовётся иначе:
    # with: { build-command: 'npm ci && npm run build', dist-dir: 'build' }
```

Для GitLab — обычный job в `.gitlab-ci.yml`, который собирает сайт,
пакует `tar -czf dist.tar.gz -C dist .` и создаёт релиз со ссылкой
на этот файл (release-cli, asset link с именем `dist.tar.gz`).

Мелочи, которые стоит знать:

- токены не нужны: публичные репы читаются анонимно, лимитов API хватает.
  Для приватных реп впиши `GITHUB_TOKEN` / `GITLAB_TOKEN` в `.env`;
- self-hosted GitLab поддерживается через `GITLAB_API` в `.env`
  (по умолчанию `https://gitlab.com/api/v4`);
- слаг из реестра принадлежит апдейтеру: ручную заливку через
  `deploy-site.bat` он перезапишет на следующем цикле. Ручной способ —
  для демок, которых в реестре нет; в панели они видны пометкой
  «вне реестра»;
- недоступный Postgres апдейтер переживает: цикл пропускается со строкой
  `[updater] реестр недоступен`, уже развёрнутые демки продолжают
  раздаваться;
- прогнать цикл руками: `docker compose run --rm sites-updater bun
  scripts/sites-updater.ts --once` (или просто смотри логи:
  `docker compose logs -f sites-updater`);
- не ждать цикла: впиши `SITES_RELOAD_TOKEN` в `.env` (сгенерировать:
  `openssl rand -hex 32`), пересоздай контейнеры — и форс-проверка
  доступна снаружи:

  ```sh
  curl -X POST -H "Authorization: Bearer $TOKEN" https://aaaver.ru/api/sites-reload
  ```

  Этот же вызов можно добавить финальным шагом в CI демки — тогда
  обновление на сайте становится мгновенным, без ожидания опроса.

## Реверс-прокси и HTTPS

Контейнер слушает 6110 без TLS. Снаружи логично поставить caddy или nginx.

Caddy (`/etc/caddy/Caddyfile`):

```
aaaver.ru {
    reverse_proxy 127.0.0.1:6110
}
```

nginx:

```nginx
server {
    server_name aaaver.ru;
    location / {
        proxy_pass http://127.0.0.1:6110;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
    }
}
```

После этого обязательно `TRUST_PROXY=1` в `.env` (и пересоздать контейнер),
иначе rate-limit будет считать всех посетителей одним IP прокси.

## Если что-то не так

```sh
docker compose logs -f app     # логи сервера
docker compose ps              # healthcheck: healthy / unhealthy
bun scripts/smoke-test.ts http://localhost:6110   # прогон api-флоу
```

Типовые случаи:

- *Сообщения не приходят в TG* — смотреть логи: либо нет токена, либо
  никто не написал боту `/start`. Сообщения при этом не теряются, лежат
  в БД с `delivered = 0` и дошлются сами.
- *429 на форме у всех подряд* — забыли `TRUST_PROXY=1` за прокси.
- *Всё, что ходит в базу, отвечает 503* — Postgres недоступен. Смотреть
  логи контейнера: строки `[db] недоступен` называют причину. Сайт при
  этом продолжает отдавать портфолио и демки, чинить его не нужно —
  сервер подключится сам, как только база вернётся.
