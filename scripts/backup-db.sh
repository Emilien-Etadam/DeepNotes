#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/deepnotes/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

docker exec deepnotes-postgres pg_dump -U deepnotes -d deepnotes --format=custom > "$BACKUP_DIR/deepnotes_${TIMESTAMP}.dump"

find "$BACKUP_DIR" -name "*.dump" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: deepnotes_${TIMESTAMP}.dump"
