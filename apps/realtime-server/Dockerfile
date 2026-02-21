FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

WORKDIR /build
COPY ./ ./
RUN pnpm install --filter deepnotes --filter @deepnotes/realtime-server...
RUN pnpm --filter @deepnotes/realtime-server run bundle

FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /build/apps/realtime-server/dist/ ./
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate && \
    pnpm init && \
    pnpm add pg kysely ws libsodium-wrappers-sumo

CMD ["node", "index.js"]
