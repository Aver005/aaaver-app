# --- зависимости ---
FROM oven/bun:1.4-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- сборка фронтенда ---
FROM deps AS build
COPY . .
RUN bun run build

# --- рантайм: у сервера ноль npm-зависимостей, node_modules не нужен ---
FROM oven/bun:1.4-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY server ./server
# апдейтер демок живёт в этом же образе, вторым сервисом compose
COPY scripts ./scripts
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["bun", "server/index.ts"]
