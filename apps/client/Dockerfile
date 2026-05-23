FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@10.30.1 --activate

WORKDIR /build
COPY ./ ./

RUN pnpm install
RUN pnpm run repo:build
RUN pnpm --filter @deepnotes/client run build:spa

FROM nginx:alpine AS runner

COPY --from=builder /build/apps/client/dist/spa /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/client/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
CMD ["/docker-entrypoint.sh"]
