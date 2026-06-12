/** Поднимает vite и api-сервер одной командой: bun dev */
export {}

const processes = [
    Bun.spawn(['bun', '--watch', 'server/index.ts'], {
        stdio: ['inherit', 'inherit', 'inherit'],
        env: { ...process.env, PORT: process.env.PORT ?? '3001' },
    }),
    Bun.spawn(['bun', 'x', 'vite'], {
        stdio: ['inherit', 'inherit', 'inherit'],
    }),
]

function shutdown() {
    for (const p of processes) p.kill()
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

await Promise.race(processes.map((p) => p.exited))
shutdown()
