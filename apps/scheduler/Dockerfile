FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

WORKDIR /build
COPY ./ ./
RUN pnpm install --filter deepnotes --filter @deepnotes/scheduler...
RUN pnpm --filter @deepnotes/scheduler run bundle

FROM node:22-alpine AS runner

WORKDIR /app
COPY --from=builder /build/apps/scheduler/dist/ ./
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
RUN pnpm init
RUN pnpm install knex pg libsodium-wrappers-sumo

CMD ["node", "index.js"]
