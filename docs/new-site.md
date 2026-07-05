# Новый сайтик: чеклист

Сценарий: есть проект с веб-мордой, хочется получить её живьём на
`https://aaaver.ru/<slug>/`. Слаг — строчные латинские буквы, цифры,
дефис; `api`, `assets` и `projects` заняты.

## Путь 1: репа на GitHub, всё само (основной)

### 1. В репе демки — поправить base

В её vite-конфиге:

```ts
export default defineConfig({
    base: '/poopseek/',   // = /<slug>/
    ...
})
```

Без этого демка будет искать свои ассеты в корне сайта и промахнётся.
Если внутри нет клиентского роутера, подойдёт и `base: './'`.

### 2. В репе демки — добавить workflow

Минимальный вариант (bun-проект, сборка в `dist/`, главная ветка
`master`) — файл `.github/workflows/demo.yml`, целиком:

```yaml
on: { push: { branches: [master] } }
jobs:
  demo:
    uses: Aver005/aaaver-app/.github/workflows/site-release.yml@master
    permissions: { contents: write }
```

Что здесь что:

- `branches: [master]` — ветка **демки**, пуш в которую пересобирает
  сайт. Главная ветка называется иначе — пиши её: `branches: [develop]`;
- `@master` в `uses:` — ветка **aaaver-app**, где лежит переиспользуемый
  workflow. Это не про демку, оставляй как есть;
- по умолчанию сборка: `bun install --frozen-lockfile && bun run build`,
  результат берётся из `dist/`.

Полный вариант со всеми отличиями сразу — главная ветка `develop`,
проект на npm, сборка кладёт результат в `build/`:

```yaml
on: { push: { branches: [develop] } }
jobs:
  demo:
    uses: Aver005/aaaver-app/.github/workflows/site-release.yml@master
    permissions: { contents: write }
    with:
      build-command: npm ci && npm run build
      dist-dir: build
```

`with:` нужен только для того, что отличается от дефолтов: можно
оставить один `build-command`, один `dist-dir` или оба.

### 3. Запушить и проверить релиз

После пуша во вкладке Actions демки должен пройти `site-release`,
а в репе появиться релиз `latest` с файлом `dist.tar.gz`.

### 4. В aaaver-app — прописать слаг

В `sites.config.json`:

```json
{
    "poopseek": { "repo": "github:Aver005/poopseek" }
}
```

Коммит, пуш. Дальше цепочка отрабатывает сама: автодеплой довозит
конфиг на сервер → `sites-updater` на ближайшем цикле (до 10 минут)
видит новый слаг → скачивает `dist.tar.gz` → сайт живой.

### 5. Убедиться

- `https://aaaver.ru/<slug>/` открывается;
- `curl https://aaaver.ru/api/sites` — слаг в списке;
- если нет — `docker compose logs -f sites-updater` на сервере,
  он словами пишет, что его не устроило (нет релиза, нет index.html
  в корне архива и т.п.).

### 6. По вкусу: карточка на главной

Ссылку в карточке проекта (`src/entities/project/model/data.ts`)
можно перевести с GitHub на `/<slug>/`.

Готово. Дальше каждый пуш в репу демки обновляет её на сайте сам,
руки больше не нужны.

## Путь 2: репы нет / разовая заливка

Собрал локально — залил скриптом:

```bat
deploy-site.bat <slug> E:\путь\к\dist
```

Требование про `base: '/<slug>/'` то же. В `sites.config.json` такой
слаг добавлять **не надо**: слаги из конфига принадлежат апдейтеру,
и ручную заливку он перезапишет.

## Путь 3: репа на GitLab

Шаги те же, что в пути 1, но релиз публикует `.gitlab-ci.yml` демки:
собрать, упаковать `tar -czf dist.tar.gz -C dist .`, создать релиз
с тегом `latest` и asset-ссылкой с именем `dist.tar.gz` (release-cli).
В конфиге: `{ "repo": "gitlab:group/project" }`; self-hosted инстанс —
через `GITLAB_API` в `.env` на сервере.

## Локально потыкать перед выкаткой

```sh
mkdir -p sites/poopseek        # содержимое dist демки — сюда
bun dev                        # и перезапустить, если dev уже был поднят
# http://localhost:5173/poopseek/ (или :3001/poopseek/ напрямую с api)
```

Каталог `sites/` в гитигноре, ничего не закоммитится.
