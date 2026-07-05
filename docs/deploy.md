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

## База данных

SQLite лежит на хосте: `./data/aaaver.db` (+ служебные `-wal`/`-shm`).
Контейнер видит её через bind mount `./data:/data`, поэтому:

- скачать базу = просто скопировать файл (лучше через `.backup`, чтобы
  не поймать момент записи):

  ```sh
  sqlite3 data/aaaver.db ".backup /tmp/aaaver-backup.db"
  ```

- подменить базу = остановить контейнер, заменить файл, запустить:

  ```sh
  docker compose stop && cp my.db data/aaaver.db && docker compose start
  ```

- посмотреть сообщения:

  ```sh
  sqlite3 data/aaaver.db "SELECT id, name, contact, delivered FROM messages ORDER BY id DESC LIMIT 10;"
  ```

Каталог `data/` создаётся при первом запуске автоматически. Важно: bind
mount должен указывать на обычную локальную папку (ext4 и т.п.), сетевые
ФС (NFS, virtiofs и прочее) для SQLite — плохая идея.

## Статичные демки

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
`sites-updater` (второй сервис в compose, тот же образ), который
опрашивает релизы реп из `sites.config.json` и сам обновляет `sites/`.

`sites.config.json` в корне репозитория:

```json
{
    "poopseek": { "repo": "github:Aver005/poopseek" },
    "warcube": { "repo": "gitlab:group/warcube", "asset": "dist.tar.gz", "tag": "v2.0" }
}
```

Поля: `repo` — обязательное, `github:owner/repo` или `gitlab:group/project`;
`asset` — имя файла в релизе (по умолчанию `dist.tar.gz`); `tag` — пин на
конкретный тег (по умолчанию тег `latest`, если его нет — последний релиз).
Файл монтируется в контейнер, так что правка на сервере подхватывается
на следующем цикле без пересборки.

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
- слаг из `sites.config.json` принадлежит апдейтеру: ручную заливку
  через `deploy-site.bat` он перезапишет на следующем цикле. Ручной
  способ — для демок, которых в конфиге нет;
- прогнать цикл руками: `docker compose run --rm sites-updater bun
  scripts/sites-updater.ts --once` (или просто смотри логи:
  `docker compose logs -f sites-updater`).

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
- *Контейнер не пишет в БД* — проверить права на `./data` (контейнер
  работает от root, так что обычно проблема в read-only ФС или SELinux).
