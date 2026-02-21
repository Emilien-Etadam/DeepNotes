FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /build
COPY ./ ./
RUN pnpm install --filter deepnotes --filter @deepnotes/collab-server...
RUN pnpm --filter @deepnotes/collab-server run bundle

FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /build/apps/collab-server/dist/ ./
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN pnpm init
RUN pnpm install knex pg ws libsodium-wrappers-sumo

CMD ["node", "index.js"]
