#!/bin/bash
set -e

cd /opt/deepnotes

echo "[info] Pulling latest code..."
git pull origin dev

echo "[info] Pulling latest images..."
docker compose pull

echo "[info] Restarting containers..."
docker compose down
docker compose up -d

echo "[ok] DeepNotes updated successfully."
