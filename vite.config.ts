import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

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
