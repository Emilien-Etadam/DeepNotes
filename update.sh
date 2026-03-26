#!/bin/bash
set -e

cd /opt/deepnotes

echo "[info] Pulling latest code..."
git pull origin dev

# Regenerate keydb.conf if missing (not versioned, generated at install)
if [ ! -f keydb.conf ]; then
  KEYDB_PASS=$(grep KEYDB_PASSWORD .env | cut -d'"' -f2)
  echo "requirepass ${KEYDB_PASS}" > keydb.conf
  echo "[info] Regenerated keydb.conf"
fi

echo "[info] Pulling latest images..."
docker compose pull

echo "[info] Restarting containers..."
docker compose down
docker compose up -d

echo "[ok] DeepNotes updated successfully."
