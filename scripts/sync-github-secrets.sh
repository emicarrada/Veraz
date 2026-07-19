#!/usr/bin/env bash
# Push local .env.local values to GitHub Actions secrets.
# Usage: ./scripts/sync-github-secrets.sh
# Requires: gh CLI logged in with repo access

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from .env.example first."
  exit 1
fi

read_env_var() {
  local name="$1"
  local line
  line="$(grep -m1 "^${name}=" "$ENV_FILE" || true)"
  if [[ -z "$line" ]]; then
    echo ""
    return
  fi
  echo "${line#*=}"
}

SECRETS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEWS_RSS_FEEDS
)

for name in "${SECRETS[@]}"; do
  value="$(read_env_var "$name")"
  if [[ -z "$value" ]]; then
    echo "Skip $name (empty)"
    continue
  fi
  printf '%s' "$value" | gh secret set "$name"
  echo "Synced $name to GitHub Actions secrets (${#value} chars)"
done

echo "Done. Workflows read NEWS_INGESTION_ENABLED=true and VERAZ_ENV=production from the workflow files."
