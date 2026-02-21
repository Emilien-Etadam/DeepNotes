FROM node:22-slim AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /build
COPY ./ ./

# SPA needs these at build time (inlined in bundle). Use same host as client so browser can reach backends.
ARG APP_SERVER_URL=http://localhost:48922/trpc
ARG COLLAB_SERVER_URL=ws://localhost:48923
ARG REALTIME_SERVER_URL=ws://localhost:48924
ENV APP_SERVER_URL=${APP_SERVER_URL}
ENV COLLAB_SERVER_URL=${COLLAB_SERVER_URL}
ENV REALTIME_SERVER_URL=${REALTIME_SERVER_URL}

RUN pnpm install --filter deepnotes --filter @deepnotes/client...
RUN pnpm run repo:build
RUN pnpm --filter @deepnotes/client run build:spa

FROM nginx:alpine AS runner

COPY --from=builder /build/apps/client/dist/spa /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
