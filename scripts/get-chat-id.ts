/**
 * Помогает узнать свой telegram chat_id:
 *   1. напишите боту /start
 *   2. bun run chat-id
 *   3. впишите число в TELEGRAM_CHAT_ID в .env (или не вписывайте —
 *      сервер найдёт его сам тем же способом и запомнит в БД)
 */
export {}

const token = process.env.TELEGRAM_BOT_TOKEN

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN не задан в .env')
    process.exit(1)
}

const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`)
const data = (await res.json()) as {
    ok: boolean
    description?: string
    result: Array<{
        message?: { chat?: { id: number; type: string; username?: string; first_name?: string } }
    }>
}

if (!data.ok) {
    console.error(`Telegram API ответил ошибкой: ${data.description ?? 'неизвестно'}`)
    process.exit(1)
}

const chats = new Map<number, { type: string; who: string }>()
for (const update of data.result) {
    const chat = update.message?.chat
    if (chat) {
        chats.set(chat.id, {
            type: chat.type,
            who: chat.username ? `@${chat.username}` : (chat.first_name ?? ''),
        })
    }
}

if (chats.size === 0) {
    console.log('Обновлений нет. Напишите боту /start и запустите скрипт ещё раз.')
    process.exit(0)
}

console.log('Найденные чаты:')
for (const [id, info] of chats) {
    console.log(`  TELEGRAM_CHAT_ID=${id}  (${info.type}, ${info.who})`)
}
