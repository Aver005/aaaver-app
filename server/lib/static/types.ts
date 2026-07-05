/** Разобранный запрос статики — всё, что нужно обработчикам */
export interface StaticContext {
    req: Request
    /** декодированный url.pathname */
    pathname: string
    /** query-строка вместе с `?` (пустая, если её нет) — для редиректов */
    search: string
}

/**
 * Обработчик статики: вернул Response — готово,
 * вернул null — запрос не его, пробуем следующий в конвейере.
 */
export type StaticHandler = (ctx: StaticContext) => Promise<Response | null>
