#!/usr/bin/env bash
# Install Postgres on the existing social EC2 and print DATABASE_URL.
# Usage: ./scripts/vps-postgres-setup.sh
set -euo pipefail

VPS_HOST="${VERAZ_VPS_HOST:-ubuntu@3.87.109.197}"
VPS_KEY="${VERAZ_VPS_KEY:-$HOME/Descargas/veraz-social.pem}"
DB_NAME="${VERAZ_DB_NAME:-veraz}"
DB_USER="${VERAZ_DB_USER:-veraz}"
DB_PASSWORD="${VERAZ_DB_PASSWORD:-}"

if [[ ! -f "$VPS_KEY" ]]; then
  echo "Missing SSH key: $VPS_KEY"
  exit 1
fi

if [[ -z "$DB_PASSWORD" ]]; then
  DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 28)"
fi

HOST_IP="${VPS_HOST#*@}"

echo "Installing Postgres on $VPS_HOST …"

ssh -i "$VPS_KEY" -o BatchMode=yes -o ConnectTimeout=15 "$VPS_HOST" bash -s <<EOF
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;
SQL

sudo -u postgres psql -v ON_ERROR_STOP=1 -c "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres createdb -O ${DB_USER} ${DB_NAME}

CONF=\$(sudo -u postgres psql -tA -c "SHOW config_file")
HBA=\$(sudo -u postgres psql -tA -c "SHOW hba_file")
sudo sed -i "s/^#\\?listen_addresses.*/listen_addresses = '*'/" "\$CONF"
if ! sudo grep -q "0.0.0.0/0" "\$HBA"; then
  echo "host    ${DB_NAME}    ${DB_USER}    0.0.0.0/0    scram-sha-256" | sudo tee -a "\$HBA" >/dev/null
fi
sudo systemctl restart postgresql
sudo -u postgres psql -d ${DB_NAME} -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
echo "Postgres is listening."
EOF

DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${HOST_IP}:5432/${DB_NAME}?sslmode=disable"

echo
echo "DATABASE_URL=${DATABASE_URL}"
echo
echo "Next:"
echo "  1. AWS Security Group of this EC2: inbound TCP 5432 from 0.0.0.0/0 (Vercel IPs change)."
echo "  2. Add DATABASE_URL to .env.local, then: npm run db:migrate && npm run ingest:run"
echo "  3. Sync secrets: ./scripts/sync-vercel-env.sh && ./scripts/sync-github-secrets.sh"
echo "  4. Copy DATABASE_URL into the VPS .env.local as well."
