export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} Б`
    const units = ['КБ', 'МБ', 'ГБ']
    let value = bytes / 1024
    let unit = 0
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024
        unit++
    }
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

const dateFormat = new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
})

export function formatDate(iso: string | null): string {
    if (!iso) return '—'
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}

/**
 * Версия апдейтера — это `тег@время-обновления-ассета`, целиком её в таблице
 * читать невозможно. Показываем хвост: тег и так стоит отдельной колонкой,
 * а различать версии между собой помогает именно время.
 */
export function shortVersion(version: string | null): string {
    if (!version) return 'вручную'
    const at = version.indexOf('@')
    return at === -1 ? version : version.slice(at + 1)
}
