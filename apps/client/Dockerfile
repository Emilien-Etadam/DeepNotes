FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /build
COPY ./ ./
RUN pnpm install --filter deepnotes --filter @deepnotes/client...
RUN pnpm run repo:build
RUN pnpm --filter @deepnotes/client run build:spa

FROM nginx:alpine AS runner

COPY --from=builder /build/apps/client/dist/spa /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
