#!/usr/bin/env bash
# Install social crontab on AWS VPS from social-crontab.example
set -euo pipefail

VPS_HOST="${VERAZ_VPS_HOST:-ubuntu@3.87.109.197}"
VPS_KEY="${VERAZ_VPS_KEY:-$HOME/Descargas/veraz-social.pem}"
VPS_DIR="${VERAZ_VPS_DIR:-/home/veraz/Veraz}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

scp -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new "$ROOT/scripts/social-crontab.example" "$VPS_HOST:/tmp/veraz-social-crontab"

ssh -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new "$VPS_HOST" "set -e
mkdir -p $VPS_DIR/.social
( crontab -l 2>/dev/null | grep -v 'npm run social:publish' | grep -v 'npm run social:deliver:video' | grep -v 'npm run social:publish:video' | grep -v '^VERAZ_DIR=' | grep -v '^LOG=' | grep -v '^VIDEO_LOG=' || true
  sed \"s|VERAZ_DIR=.*|VERAZ_DIR=$VPS_DIR|\" /tmp/veraz-social-crontab | grep -v '^#' | grep -v '^$'
) | crontab -
crontab -l
echo 'Crontab installed.'
"
