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

echo "[info] Updating containers..."
docker compose up -d --remove-orphans
# Restart client to refresh DNS cache for upstream containers
docker compose restart client
echo "[info] Client restarted to refresh DNS"

echo "[ok] DeepNotes updated successfully."
