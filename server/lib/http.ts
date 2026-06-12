import type { Server } from 'bun'
import { config } from '../config'

export type BunServer = Server<unknown>

export function json(data: unknown, status = 200): Response {
    return Response.json(data, { status })
}

export function getClientIp(req: Request, server: BunServer): string {
    if (config.trustProxy) {
        const forwarded = req.headers.get('x-forwarded-for')
        if (forwarded) {
            const first = forwarded.split(',')[0]?.trim()
            if (first) return first
        }
        const real = req.headers.get('x-real-ip')
        if (real) return real.trim()
    }
    return server.requestIP(req)?.address ?? 'unknown'
}
