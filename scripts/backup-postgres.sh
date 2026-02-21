#!/usr/bin/env bash
#
# Sauvegarde PostgreSQL DeepNotes (conteneur Docker).
# Usage:
#   ./scripts/backup-postgres.sh [répertoire_de_sortie]
# Si aucun répertoire n'est donné, utilise ./backups (créé à la racine du repo).
# Variables d'environnement optionnelles (sinon valeurs par défaut) :
#   POSTGRES_USER, PGPASSWORD, POSTGRES_DB
#

set -e

CONTAINER_NAME="${POSTGRES_CONTAINER:-postgres}"
OUT_DIR="${1:-$(dirname "$0")/../backups}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-deepnotes}"

mkdir -p "$OUT_DIR"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FILE="$OUT_DIR/deepnotes-pg-$TIMESTAMP.sql"

# PGPASSWORD : définir dans l'environnement ou mettre POSTGRES_PASSWORD dans .env à la racine
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -z "$PGPASSWORD" ] && [ -f "$ROOT/.env" ]; then
  POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' "$ROOT/.env" | cut -d= -f2- | tr -d '"')
  export PGPASSWORD="${POSTGRES_PASSWORD:-postgres_password_here}"
fi
export PGPASSWORD="${PGPASSWORD:-postgres_password_here}"

echo "Backup Postgres -> $FILE"
docker exec "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$FILE"
echo "Done. Size: $(du -h "$FILE" | cut -f1)"
