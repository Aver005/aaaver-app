import { useEffect, useState } from 'react'

function formatTime(timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date())
}

/** «14:05» в заданном поясе, обновляется раз в полминуты */
export function useClock(timeZone: string, locale: string): string {
    const [time, setTime] = useState(() => formatTime(timeZone, locale))

    useEffect(() => {
        setTime(formatTime(timeZone, locale))
        const id = setInterval(() => setTime(formatTime(timeZone, locale)), 30_000)
        return () => clearInterval(id)
    }, [timeZone, locale])

    return time
}
