#!/usr/bin/env bash
# Detiene el laboratorio y el túnel:  bash scripts/stop.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

echo "==> Deteniendo contenedores..."
docker compose down

echo "==> Hecho. La URL pública deja de funcionar (los contenedores están apagados)."
echo "    Los datos de laboratorio se conservan en el volumen 'lab-data'."
