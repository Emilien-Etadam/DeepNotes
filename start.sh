#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

# Start Docker containers if not running
docker-compose up -d 2>/dev/null || true

# Fix KeyDB write error
redis-cli -a "keydb_password_here" config set stop-writes-on-bgsave-error no 2>/dev/null || true

# Copy env if missing
[ ! -f .env ] && cp template.env .env

# Install deps if needed
[ ! -d node_modules ] && pnpm install

# Build packages (tsc + tsc-alias)
npx tsc --build tsconfig.packages.json --force 2>/dev/null || true
pnpm exec turbo run repo:build --parallel 2>/dev/null || true

# Start backend in background
pnpm run dev &
BACKEND_PID=$!

# Wait for app-server to be ready
echo "Waiting for backend..."
for i in $(seq 1 60); do
  curl -s http://localhost:48922 > /dev/null 2>&1 && break
  sleep 1
done
echo "Backend ready."

# Start frontend
pnpm run spa:dev &
FRONTEND_PID=$!

echo ""
echo "DeepNotes running:"
echo "  Frontend: http://localhost:61033"
echo "  Backend:  http://localhost:48922"
echo ""
echo "Press Ctrl+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
