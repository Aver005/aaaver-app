import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Демки из sites/ в деве проксируем на bun-сервер, как и /api.
 *  Список читается при старте vite — добавил демку, перезапусти dev. */
function siteProxies(): Record<string, string> {
    try {
        const dir = fileURLToPath(new URL('./sites', import.meta.url))
        const entries = readdirSync(dir, { withFileTypes: true })
        return Object.fromEntries(
            entries
                .filter((e) => e.isDirectory() && /^[a-z0-9-]+$/.test(e.name))
                .map((e) => [`/${e.name}`, 'http://localhost:3001']),
        )
    } catch {
        return {} // sites/ нет — и не надо
    }
}

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:3001',
            ...siteProxies(),
        },
    },
    build: {
        target: 'es2022',
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    motion: ['motion'],
                },
            },
        },
    },
})
