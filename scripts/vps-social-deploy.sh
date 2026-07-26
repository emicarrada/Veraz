#!/usr/bin/env bash
# Deploy social publishing code on AWS VPS via git pull.
set -euo pipefail

VPS_HOST="${VERAZ_VPS_HOST:-ubuntu@3.87.109.197}"
VPS_KEY="${VERAZ_VPS_KEY:-$HOME/Descargas/veraz-social.pem}"
VPS_DIR="${VERAZ_VPS_DIR:-/home/veraz/Veraz}"

SSH=(ssh -i "$VPS_KEY" -o StrictHostKeyChecking=accept-new "$VPS_HOST")

echo "Deploying on $VPS_HOST ($VPS_DIR)…"
"${SSH[@]}" "set -e
cd $VPS_DIR
git pull origin main
npm ci
npx playwright install chrome
sudo npx playwright install-deps chrome 2>/dev/null || true
command -v ffmpeg >/dev/null || sudo apt-get install -y ffmpeg
echo 'Deploy OK.'
"
