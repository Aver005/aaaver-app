-- Админка: сессии и защита от повторного предъявления токена панели.

CREATE TABLE admin_sessions (
    -- НЕ сам токен из cookie, а его sha256. Дамп этой таблицы не должен
    -- давать готовых ключей от панели: хеша хватает, чтобы узнать сессию по
    -- предъявленному значению, но не хватает, чтобы предъявить её самому.
    id         text PRIMARY KEY,
    -- `sub` панели: неизменный идентификатор человека. Почта может смениться,
    -- он — нет, поэтому в журнале действий опираться будем на него.
    sub        text NOT NULL,
    email      text NOT NULL,
    name       text NOT NULL,
    ip         text NOT NULL DEFAULT '',
    user_agent text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);

CREATE INDEX admin_sessions_expires_at_idx ON admin_sessions (expires_at);

-- Одноразовость утверждения панели.
--
-- Токен живёт минуту и приезжает POST-ом формы, то есть его легко отправить
-- второй раз — кнопкой «обновить» на странице возврата или повтором из
-- журнала прокси. `jti` в первичном ключе превращает второй такой заход в
-- нарушение уникальности, то есть в отказ.
CREATE TABLE sso_used_tokens (
    jti     text PRIMARY KEY,
    used_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sso_used_tokens_used_at_idx ON sso_used_tokens (used_at);
