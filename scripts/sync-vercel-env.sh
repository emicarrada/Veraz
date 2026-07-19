#!/usr/bin/env bash
# Push local .env.local values to the linked Vercel project.
# Usage: ./scripts/sync-vercel-env.sh
# Requires: vercel CLI logged in, project linked (.vercel/project.json)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from .env.example first."
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

if [[ -z "${CRON_SECRET:-}" ]]; then
  CRON_SECRET="$(openssl rand -hex 32)"
  echo "CRON_SECRET=$CRON_SECRET" >> "$ENV_FILE"
  echo "Generated CRON_SECRET and appended to .env.local"
fi

SHARED_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEWS_INGESTION_ENABLED
  NEWS_RSS_FEEDS
  CRON_SECRET
)

PRODUCTION_VARS=(
  VERAZ_ENV
  NEXT_PUBLIC_SITE_URL
  NEXT_PUBLIC_APP_NAME
)

sync_var() {
  local name="$1"
  local target="$2"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "Skip $name ($target, empty)"
    return
  fi
  printf '%s' "$value" | vercel env add "$name" "$target" --force --yes
  echo "Synced $name ($target)"
}

for name in "${SHARED_VARS[@]}"; do
  sync_var "$name" production
done

# Production-only profile (falls back when unset locally).
VERAZ_ENV="${VERAZ_ENV:-production}"
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://www.veraz.app}"
NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-Veraz}"

for name in "${PRODUCTION_VARS[@]}"; do
  sync_var "$name" production
done

echo "Done. Deploy with: vercel deploy --prod"
