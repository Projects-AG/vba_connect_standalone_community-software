#!/usr/bin/env bash
# Pull origin/main and rebuild the production stack.
# Preserves deploy/.env.prod and deploy/livekit.prod.yaml (secrets, not in git).
#
# Usage on the VPS:
#   cd /opt/loop && bash deploy/vps-update.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/loop}"
COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE="deploy/.env.prod"
LIVEKIT_FILE="deploy/livekit.prod.yaml"
BAK_DIR="/tmp/loop-deploy-bak"

cd "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy deploy/.env.prod.example and fill secrets first." >&2
  exit 1
fi

mkdir -p "$BAK_DIR"
cp -a "$ENV_FILE" "$BAK_DIR/.env.prod"
if [[ -f "$LIVEKIT_FILE" ]]; then
  cp -a "$LIVEKIT_FILE" "$BAK_DIR/livekit.prod.yaml"
fi

echo "Fetching origin/main..."
git fetch origin
git reset --hard origin/main

cp -a "$BAK_DIR/.env.prod" "$ENV_FILE"
if [[ -f "$BAK_DIR/livekit.prod.yaml" ]]; then
  cp -a "$BAK_DIR/livekit.prod.yaml" "$LIVEKIT_FILE"
fi

if [[ ! -f "$LIVEKIT_FILE" ]]; then
  echo "Missing $LIVEKIT_FILE. Copy deploy/livekit.prod.yaml.example and set keys." >&2
  exit 1
fi

echo "Building and starting compose stack..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
echo "Deploy finished."
