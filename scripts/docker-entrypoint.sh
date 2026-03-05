#!/bin/sh
set -eu

APP_DIR="/app"
ENV_FILE="${APP_DIR}/.env"

cd "${APP_DIR}"

echo "[entrypoint] Starting account-center container..."

if [ -f "${ENV_FILE}" ]; then
  echo "[entrypoint] Loading environment from ${ENV_FILE}"
  set -a
  # shellcheck source=/dev/null
  . "${ENV_FILE}"
  set +a
else
  echo "[entrypoint] No .env file mounted at ${ENV_FILE}, using existing environment variables"
fi

: "${NODE_ENV:=production}"
: "${PORT:=3000}"
: "${HOSTNAME:=0.0.0.0}"
: "${CONFIG_SOURCE_DIR:=/app/config/source}"

export NODE_ENV PORT HOSTNAME CONFIG_SOURCE_DIR

SERVICES_CONFIG="${CONFIG_SOURCE_DIR}/services.yaml"
FEATURES_CONFIG="${CONFIG_SOURCE_DIR}/features.yaml"

if [ ! -f "${SERVICES_CONFIG}" ]; then
  echo "[entrypoint] Missing services config: ${SERVICES_CONFIG}" >&2
  exit 1
fi

if [ ! -f "${FEATURES_CONFIG}" ]; then
  echo "[entrypoint] Missing features config: ${FEATURES_CONFIG}" >&2
  exit 1
fi

echo "[entrypoint] Generating runtime config from ${CONFIG_SOURCE_DIR}"
npm run config:generate

echo "[entrypoint] Building Next.js app"
npm run build

echo "[entrypoint] Starting Next.js server on ${HOSTNAME}:${PORT}"
exec ./node_modules/.bin/next start -H "${HOSTNAME}" -p "${PORT}"
