-- Исходная схема: то же, что было в SQLite, переложенное на типы Postgres.
--
-- Главное отличие — время. В SQLite всё лежало числом миллисекунд
-- (`Date.now()`), и арифметика окон rate-limit жила в JS. Здесь окна считает
-- сам Postgres (`now() - interval '1 hour'`), а из базы приезжает готовый
-- `Date` — миллисекунд в коде больше нет.

CREATE TABLE messages (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name              text NOT NULL,
    contact           text NOT NULL,
    message           text NOT NULL,
    locale            text NOT NULL DEFAULT 'ru',
    ip                text NOT NULL DEFAULT '',
    user_agent        text NOT NULL DEFAULT '',
    -- jsonb, а не text: список коротких меток, который хочется уметь
    -- спрашивать («сколько писем с honeypot»), не разбирая строку руками.
    spam_flags        jsonb NOT NULL DEFAULT '[]'::jsonb,
    -- 0 — ждёт отправки, 1 — доставлено, -1 — honeypot, доставлять не будем
    delivered         smallint NOT NULL DEFAULT 0,
    delivery_attempts integer NOT NULL DEFAULT 0,
    created_at        timestamptz NOT NULL DEFAULT now()
);

-- Частичный: досылка спрашивает только про недоставленное, а это единицы
-- строк из всей таблицы.
CREATE INDEX messages_pending_idx ON messages (id) WHERE delivered = 0;

CREATE TABLE challenges (
    -- text, а не uuid, СОЗНАТЕЛЬНО: сюда приезжает `challengeId` из тела
    -- запроса, то есть строка от постороннего. У колонки типа uuid кривое
    -- значение роняло бы сам запрос ошибкой Postgres — то есть 500 вместо
    -- честного 403 «капча не сошлась».
    id          text PRIMARY KEY,
    salt        text NOT NULL,
    difficulty  integer NOT NULL,
    ip          text NOT NULL DEFAULT '',
    issued_at   timestamptz NOT NULL DEFAULT now(),
    consumed_at timestamptz
);

CREATE INDEX challenges_issued_at_idx ON challenges (issued_at);

CREATE TABLE attempts (
    id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ip   text NOT NULL,
    kind text NOT NULL,
    at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX attempts_ip_kind_at_idx ON attempts (ip, kind, at DESC);

CREATE TABLE settings (
    key   text PRIMARY KEY,
    value text NOT NULL
);
