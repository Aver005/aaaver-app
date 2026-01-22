import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClassValue } from "clsx";

export function cn(...inputs: Array<ClassValue>)
{
    return twMerge(clsx(inputs))
}

export function getLocalized(obj: Record<string, string> | null | undefined, locale: string): string
{
    if (!obj) return ''
    return obj[locale] || obj['en'] || obj['ru'] || Object.values(obj)[0] || ''
}
