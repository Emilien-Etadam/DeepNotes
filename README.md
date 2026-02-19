# DeepNotes

Open source, end-to-end encrypted infinite canvas with deep page nesting and realtime collaboration.

Fork maintained by [Emilien-Etadam](https://github.com/Emilien-Etadam) with build fixes for local development.

## Prerequisites

- **Node 20+** (recommandé : Node 22 via [nvm](https://github.com/nvm-sh/nvm) — `nvm use 22` ou `nvm alias default 22`)
- **pnpm 9** (géré par le repo via `packageManager`)
- **Docker** (pour PostgreSQL et KeyDB en dev)

## Installation

```bash
# 1. Node 22 (nvm)
nvm install 22
nvm use 22

# 2. Clone et entrer dans le repo
git clone https://github.com/Emilien-Etadam/DeepNotes.git
cd DeepNotes

# 3. Dépendances
pnpm install

# 4. Build des packages
npx tsc --build tsconfig.packages.json
pnpm run repo:build

# 5. Environnement
cp template.env .env
# Éditer .env si besoin
```

## Lancer le projet

**Option simple (tout en un) :**

```bash
./start.sh
```

Démarre Postgres/KeyDB (Docker), backend puis frontend. Frontend : http://localhost:61033 — Backend : http://localhost:48922

**Option Docker uniquement :**

```bash
./start.sh --docker
```

**Option manuelle (2 terminaux) :**

Terminal 1 : `pnpm run dev` (attendre "app-server started on port 48922")
Terminal 2 : `pnpm run spa:dev` → http://localhost:61033

Default Ports
Service	Port
Frontend (SPA)	61033
App Server	48922
Realtime Server	31074
Collab Server	33245
PostgreSQL	5432
KeyDB (Redis)	6379
Troubleshooting
KeyDB write errors: Run redis-cli -a "keydb_password_here" config set stop-writes-on-bgsave-error no.

Port already in use: Stop native PostgreSQL/Redis if running (sudo service postgresql stop && sudo service redis-server stop) before starting Docker.

Node version: Le projet requiert Node 20+. Utiliser `nvm use 22` (ou `nvm alias default 22`).

Slow first load: Normal in dev mode. Vite pre-bundles dependencies on first request.

Tech Stack
TypeScript, Vue 3, Quasar, Vite, tRPC, Tiptap, Yjs, PostgreSQL, KeyDB, libsodium (E2EE)

License
AGPL-3.0 EOF
