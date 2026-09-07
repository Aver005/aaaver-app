/** Цвета языков как на GitHub; неизвестный язык — нейтральный серый */
const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Rust: '#dea584',
    Python: '#3572a5',
    Java: '#b07219',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
}

export function languageColor(language: string): string {
    return LANGUAGE_COLORS[language] ?? '#8b8b8b'
}
