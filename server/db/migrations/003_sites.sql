-- Реестр демок переезжает из `sites.config.json` в базу.
--
-- ПОЧЕМУ ФАЙЛ БОЛЬШЕ НЕ ГОДИТСЯ. Он лежал в git И запекался в образ: панель
-- не может править то, что перезаписывается при `git pull` и при каждой
-- пересборке. Любая правка из интерфейса жила бы до следующей выкатки.
--
-- ПОЧЕМУ СИД ЛЕЖИТ ПРЯМО ЗДЕСЬ, А НЕ ЧИТАЕТСЯ ИЗ ФАЙЛА НА СТАРТЕ. Импорт
-- «если таблица пуста» выглядит аккуратнее ровно до первого раза, когда
-- владелец удалит последний сайт: следующий перезапуск вернул бы всё обратно.
-- Миграция применяется один раз по построению, и файл после неё удалён —
-- второго источника правды не остаётся.

CREATE TABLE sites (
    slug       text PRIMARY KEY,
    -- Те же правила, что у обработчика статики (`lib/static/sites.ts`).
    -- Дубль проверки в базе намеренный: слаг едет в файловый путь и в URL,
    -- и лучше отказ на вставке, чем строка, из-за которой апдейтер полезет
    -- писать не туда.
    CONSTRAINT sites_slug_shape CHECK (slug ~ '^[a-z0-9-]+$'),

    /** Человеческое имя для панели; на раздачу не влияет. */
    title      text NOT NULL DEFAULT '',
    provider   text NOT NULL CHECK (provider IN ('github', 'gitlab')),
    /** `owner/repo` — без схемы и без префикса провайдера, он в колонке рядом. */
    repo       text NOT NULL CHECK (repo <> ''),
    /** Имя ассета в релизе; пусто = `dist.tar.gz`. */
    asset      text NOT NULL DEFAULT '',
    /** Конкретный тег; пусто = скользящий `latest`, затем последний релиз. */
    tag        text NOT NULL DEFAULT '',
    /**
     * Выключенный сайт перестаёт ОБНОВЛЯТЬСЯ, но продолжает раздаваться:
     * папка на диске остаётся. Удаление файлов — отдельная операция, и
     * делать её побочным эффектом галочки было бы неожиданно.
     */
    enabled    boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO sites (slug, title, provider, repo) VALUES
    ('poopseek',    'poopseek',    'github', 'Aver005/poopseek-landing'),
    ('pooprusteek', 'pooprusteek', 'github', 'Aver005/pooprusteek-landing'),
    ('craws',       'craws',       'github', 'Aver005/craws-landing');
