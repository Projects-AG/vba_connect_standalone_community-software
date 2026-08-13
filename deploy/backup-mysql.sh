#!/usr/bin/env bash
# Backup MySQL volume data via mysqldump (run on VPS).
# Usage (from repo root):
#   ./deploy/backup-mysql.sh
# Cron example (daily 02:15 UTC):
#   15 2 * * * cd /opt/loop && ./deploy/backup-mysql.sh >> /var/log/loop-mysql-backup.log 2>&1

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/deploy/.env.prod"
OUT_DIR="${ROOT_DIR}/deploy/backups"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

mkdir -p "$OUT_DIR"
OUT_FILE="${OUT_DIR}/loop_db_${STAMP}.sql.gz"

docker compose -f "${ROOT_DIR}/deploy/docker-compose.prod.yml" --env-file "$ENV_FILE" \
  exec -T mysql mysqldump \
  -u"${DB_USER:-loop}" \
  -p"${DB_PASSWORD}" \
  "${DB_NAME:-loop_db}" | gzip > "$OUT_FILE"

echo "Wrote $OUT_FILE"

# Keep last 14 backups
ls -1t "${OUT_DIR}"/loop_db_*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
