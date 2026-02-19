# DeepNotes

Open source, end-to-end encrypted infinite canvas with deep page nesting and realtime collaboration.

Fork maintained by [Emilien-Etadam](https://github.com/Emilien-Etadam) with build fixes for local development.

## Prerequisites

- **Node 18** (via [nvm](https://github.com/nvm-sh/nvm))
- **pnpm 7.6.0** (enforced by the repo)
- **Docker** (for PostgreSQL and KeyDB)

## Installation


# 1. Install nvm and Node 18
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 2. Install pnpm
npm install -g pnpm@7.6.0

# 3. Clone the repo
git clone https://github.com/Emilien-Etadam/DeepNotes.git
cd DeepNotes

# 4. Start PostgreSQL and KeyDB
docker-compose up -d

# 5. Fix KeyDB write error
redis-cli -a "keydb_password_here" config set stop-writes-on-bgsave-error no

# 6. Configure environment
cp template.env .env

# 7. Install dependencies
pnpm install

# 8. Build packages (TypeScript errors are non-blocking)
pnpm run repo:build

# 9. Initialize the database
# The database is automatically initialized by the app-server on first run.
Copy
Running
Terminal 1 (backend servers):

Copynvm use 18
cd DeepNotes
pnpm run dev
Wait until you see app-server started on port 48922.

Terminal 2 (frontend):

Copynvm use 18
cd DeepNotes
pnpm run spa:dev
Open http://localhost:61033 in your browser.

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

Node version: This project requires Node 18. Run nvm use 18 in every terminal.

Slow first load: Normal in dev mode. Vite pre-bundles dependencies on first request.

Tech Stack
TypeScript, Vue 3, Quasar, Vite, tRPC, Tiptap, Yjs, PostgreSQL, KeyDB, libsodium (E2EE)

License
AGPL-3.0 EOF
