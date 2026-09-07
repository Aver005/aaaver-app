import type { Locale } from '@/shared/i18n'

const DAY = 24 * 3600

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * DAY],
    ['month', 30 * DAY],
    ['week', 7 * DAY],
    ['day', DAY],
]

/**
 * «сегодня», «вчера», «3 дня назад», «2 недели назад» из ISO-даты.
 * Не мельче суток: данные приходят из кэша на шесть часов, точнее нечестно.
 */
export function relativeTime(iso: string, locale: Locale, now = Date.now()): string {
    const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
    const fmt = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    for (const [unit, size] of UNITS) {
        if (seconds >= size) return fmt.format(-Math.floor(seconds / size), unit)
    }
    return fmt.format(0, 'day')
}
