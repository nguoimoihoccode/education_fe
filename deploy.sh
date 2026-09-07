#!/usr/bin/env bash
#
# deploy.sh — Build frontend image (linux/amd64) at local, upload to VPS, reload service.
#
# Usage:
#   ./deploy.sh                 # build + deploy using latest (git short sha)
#   ./deploy.sh --tag v1.2.3    # build + deploy a specific tag
#   ./deploy.sh --rollback      # reload the previously deployed image
#
# Config is read from env vars or deploy.env if present.

set -euo pipefail

# ---------- Configuration (override via deploy.env or env) ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/deploy.env" ]; then
  # shellcheck disable=SC1091
  set -a; source "$SCRIPT_DIR/deploy.env"; set +a
fi

: "${VPS_HOST:=103.20.102.93}"
: "${VPS_USER:=root}"
: "${APP_DIR:=/opt/stockvn}"
: "${SSH_KEY:=${HOME}/.ssh/stockvn_deploy}"
: "${COMPOSE_FILE:=docker-compose.prod.yml}"
: "${IMAGE_NAME:=stock-frontend}"
: "${IMAGE_TAG:=$(git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null || echo "latest")}"
: "${VITE_API_URL:=/api}"

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o LogLevel=quiet -o ConnectTimeout=20)
REMOTE="${VPS_USER}@${VPS_HOST}"
TARGET_PREFIX="${REMOTE}:${APP_DIR}"

# ---------- Flags ----------
DO_ROLLBACK=false
for arg in "$@"; do
  case "$arg" in
    --rollback) DO_ROLLBACK=true ;;
    --tag=*) IMAGE_TAG="${arg#*=}" ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

# ---------- Helpers ----------
log()  { echo -e "\033[0;34m[deploy]\033[0m $*"; }
err()  { echo -e "\033[0;31m[error]\033[0m $*" >&2; }
vssh() { ssh "${SSH_OPTS[@]}" "$REMOTE" "$@"; }
vscp() { scp "${SSH_OPTS[@]}" "$@"; }

healthcheck_frontend() {
  log "Waiting for frontend health..."
  for _ in $(seq 1 40); do
    # nginx container serves on port 8080 -> / returns the SPA
    code=$(vssh "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/ 2>/dev/null || echo 000")
    if [ "$code" = "200" ]; then
      log "Frontend healthy (HTTP 200 on :8080)."
      return 0
    fi
    sleep 5
  done
  err "Frontend health check failed."
  return 1
}

compose() { vssh "cd ${APP_DIR} && docker compose -f ${COMPOSE_FILE} --env-file .env.prod $1"; }

# ---------- Rollback mode ----------
if [ "$DO_ROLLBACK" = true ]; then
  log "Rolling back frontend to previous tag..."
  prev=$(vssh "cat ${APP_DIR}/.last-frontend-tag 2>/dev/null || echo ''")
  if [ -z "$prev" ]; then
    err "No previous tag recorded. Nothing to roll back."
    exit 1
  fi
  log "Previous tag: $prev (must already be loaded on the VPS)"
  vssh "docker tag ${IMAGE_NAME}:${prev} ${IMAGE_NAME}:latest"
  compose "up -d --remove-orphans frontend"
  healthcheck_frontend || exit 1
  log "Rollback complete."
  exit 0
fi

# ---------- Build (amd64) ----------
log "Building frontend image (linux/amd64) tag=${IMAGE_TAG}, VITE_API_URL=${VITE_API_URL} ..."
docker buildx build --platform linux/amd64 \
  --build-arg VITE_API_URL="${VITE_API_URL}" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" --load "$SCRIPT_DIR"
log "Build done."

ARCH=$(docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Architecture}}")
if [ "$ARCH" != "amd64" ]; then
  err "Built image is ${ARCH}, expected amd64. Aborting."
  exit 1
fi

# ---------- Save + upload ----------
TAR="${IMAGE_NAME}.tar"
log "Saving image to ${TAR} ..."
docker save "${IMAGE_NAME}:${IMAGE_TAG}" -o "$TAR"
log "Uploading ${TAR} to VPS..."
vscp "$TAR" "$TARGET_PREFIX"

# ---------- Load + (re)tag + redeploy ----------
log "Loading image on VPS..."
vssh "docker load -i ${APP_DIR}/${TAR}"
vssh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
rm -f "$TAR"

compose "up -d --remove-orphans frontend"

healthcheck_frontend || exit 1

# ---------- Record last good tag ----------
vssh "printf '%s' '${IMAGE_TAG}' > ${APP_DIR}/.last-frontend-tag"
log "Deployed frontend tag=${IMAGE_TAG}."
log "✓ Frontend is live. To roll back later, run: ./deploy.sh --rollback"