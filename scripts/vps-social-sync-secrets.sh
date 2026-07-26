#!/usr/bin/env bash
# Copy .env.local and browser profiles to AWS VPS (never commit these).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VPS_HOST="${VERAZ_VPS_HOST:-ubuntu@3.87.109.197}"
VPS_KEY="${VERAZ_VPS_KEY:-$HOME/Descargas/veraz-social.pem}"
VPS_DIR="${VERAZ_VPS_DIR:-/home/veraz/Veraz}"

RSYNC=(rsync -avz --progress -e "ssh -i $VPS_KEY -o StrictHostKeyChecking=accept-new")
SCP=(scp -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new)

if [[ ! -f "$ROOT/.env.local" ]]; then
  echo "Missing $ROOT/.env.local"
  exit 1
fi

echo "Syncing .env.local…"
"${SCP[@]}" "$ROOT/.env.local" "$VPS_HOST:$VPS_DIR/.env.local"

ssh -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new "$VPS_HOST" "mkdir -p $VPS_DIR/.social"

for profile in x-profile instagram-profile tiktok-profile; do
  if [[ -d "$ROOT/.social/$profile" ]]; then
    echo "Syncing .social/$profile (puede tardar varios minutos)…"
    "${RSYNC[@]}" "$ROOT/.social/$profile/" "$VPS_HOST:$VPS_DIR/.social/$profile/"
  else
    echo "Skip missing .social/$profile"
  fi
done

echo "Secrets and profiles synced to VPS."
