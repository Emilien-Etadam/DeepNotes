# DeepNotes

Self-hosted, end-to-end encrypted infinite canvas for visual note-taking.

Fork of [DeepNotesApp/DeepNotes](https://github.com/DeepNotesApp/DeepNotes) — cleaned up for self-hosting (no Stripe, no SaaS dependencies, all features unlocked).

## Features

- Infinite canvas with floating notes and directional arrows
- Deep page nesting (pages inside notes inside pages)
- End-to-end encryption (libsodium)
- Real-time collaboration (Yjs CRDT)
- Rich text editor (TipTap/ProseMirror) with math (KaTeX), code blocks, checklists
- Export any page as structured Markdown for AI assistants
- Groups with roles and encrypted invitations
- Two-factor authentication
- Dark mode

## Quick Install (Proxmox VE)

From the Proxmox shell:

```bash
bash -c "$(wget -qLO - https://raw.githubusercontent.com/Emilien-Etadam/DeepNotes/dev/pve-install.sh)"
```

Creates a Debian 12 LXC with Docker, clones the repo, generates all secrets, builds and starts the stack. Point your reverse proxy to the container's port 80.

## Manual Install (Docker)

```bash
git clone https://github.com/Emilien-Etadam/DeepNotes.git
cd DeepNotes
cp template.env .env
# Edit .env: set CLIENT_APP_URL, generate secrets with openssl rand -hex 32
docker compose up -d --build
```

## Architecture

Six Docker containers:

| Container       | Role                          |
|-----------------|-------------------------------|
| client          | Nginx serving Vue 3 SPA       |
| app-server      | Fastify + tRPC API            |
| collab-server   | Yjs WebSocket (CRDT sync)     |
| realtime-server | WebSocket notifications       |
| postgres        | PostgreSQL 16                 |
| keydb           | KeyDB (Redis-compatible cache)|

The browser talks only to the **client** origin. Nginx inside the client container (or your external reverse proxy) forwards:

| Public path        | Backend              |
|--------------------|----------------------|
| `/api/trpc`        | app-server `:48922`  |
| `/ws/collab`       | collab-server `:48923` |
| `/ws/realtime`     | realtime-server `:48924` |

Backend ports are **not** published on `0.0.0.0` by default. Use `docker-compose.override.yml.example` if you need loopback-only access for debugging.

## Reverse proxy requirement

From v1.1.0 onward, the SPA builds API and WebSocket URLs from `window.location`. Your public URL must expose these paths on the **same origin** as the web app (HTTPS recommended).

### Nginx example

```nginx
location /api/trpc/ {
  proxy_pass http://app-server:48922/trpc/;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location /ws/collab/ {
  proxy_pass http://collab-server:48923/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_read_timeout 86400s;
}

location /ws/realtime {
  proxy_pass http://realtime-server:48924;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_read_timeout 86400s;
}
```

The included `apps/client/nginx.conf` applies the same routing when using the stock Docker client image.

### Nginx Proxy Manager (Custom Locations)

Create one proxy host for your app domain, forward `/` to the client container (`http://<client-ip>:80`), then add **Custom locations**:

| Location        | Forward scheme | Forward host:port        | Websockets |
|-----------------|----------------|--------------------------|------------|
| `/api/trpc`     | http           | `app-server:48922`       | off        |
| `/ws/collab`    | http           | `collab-server:48923`    | on         |
| `/ws/realtime`  | http           | `realtime-server:48924`  | on         |

For `/api/trpc`, set the path to strip/replace so upstream receives `/trpc` (NPM “Forward path” `/trpc` or equivalent). Enable “Block common exploits” only if it does not strip WebSocket upgrades on `/ws/*`.

## Configuration

Copy `template.env` to `.env`. All secrets must be replaced with unique values generated via `openssl rand -hex 32` (for hex secrets) or `openssl rand -base64 32` (for base64 keys).

| Variable | Purpose |
|----------|---------|
| `CLIENT_APP_URL` | Public HTTPS URL of the app (cookies, CORS, emails) |
| `CLIENT_URL` | Origin used during local dev (`pnpm dev`) |
| `ALLOWED_ORIGINS` | Optional comma-separated extra CORS origins |

## Local development

`pnpm dev` runs the Quasar/Vite dev server with a built-in proxy:

- `/api/trpc` → `http://127.0.0.1:48922/trpc`
- `/ws/collab` → collab-server
- `/ws/realtime` → realtime-server

Start backends on ports `48922`, `48923`, and `48924` as before.

## Migration from versions before 1.1.0

1. Pull the new version and rebuild: `docker compose up -d --build`.
2. Remove obsolete variables from `.env`: `APP_SERVER_URL`, `COLLAB_SERVER_URL`, `REALTIME_SERVER_URL` (and any Docker build `ARG` overrides for the client).
3. Configure your reverse proxy (or use the bundled client nginx) to expose `/api/trpc`, `/ws/collab`, and `/ws/realtime` on the same domain as the SPA.
4. Set `CLIENT_APP_URL` to that public URL (e.g. `https://notes.example.com`).
5. If the app is served from an additional origin, add it to `ALLOWED_ORIGINS`.
6. Stop publishing backend ports `48922–48924` on `0.0.0.0` unless you use the optional `docker-compose.override.yml` for localhost debugging.

## Update

```bash
bash /opt/deepnotes/update.sh
```

## Backups

- Manual run:
  ```bash
  bash scripts/backup-db.sh
  ```
- Install cron:
  ```bash
  echo "0 3 * * * /opt/deepnotes/scripts/backup-db.sh >> /var/log/deepnotes-backup.log 2>&1" | crontab -
  ```
- Restore:
  ```bash
  docker exec -i deepnotes-postgres pg_restore -U deepnotes -d deepnotes --clean < backup.dump
  ```

## License

AGPL-3.0 — same as the original project.
