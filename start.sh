#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 18

# Start Docker containers if not running
docker-compose up -d 2>/dev/null

# Fix KeyDB write error
redis-cli -a "keydb_password_here" config set stop-writes-on-bgsave-error no 2>/dev/null

# Copy env if missing
[ ! -f .env ] && cp template.env .env

# Install deps if needed
[ ! -d node_modules ] && pnpm install

# Start backend in background
pnpm run dev &
BACKEND_PID=$!

# Wait for app-server to be ready
echo "Waiting for backend..."
until curl -s http://localhost:48922 > /dev/null 2>&1; do
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
