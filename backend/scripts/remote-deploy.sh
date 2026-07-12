#!/usr/bin/env sh
set -eu

IMAGE="${1:?image required}"
ENV_FILE="${ENV_FILE:-/opt/vba-backend/.env}"
CONTAINER_NAME="${CONTAINER_NAME:-vba-backend}"
HOST_PORT="${HOST_PORT:-3000}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE"
  echo "Create it on the VM with LIVEKIT_* / PORT / CORS_ORIGINS"
  exit 1
fi

docker pull "$IMAGE"
docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --env-file "$ENV_FILE" \
  "$IMAGE"

echo "Deployed $IMAGE as $CONTAINER_NAME on :$HOST_PORT"
