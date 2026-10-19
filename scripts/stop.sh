#!/usr/bin/env bash
# Detiene el laboratorio y el túnel:  bash scripts/stop.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

if docker info >/dev/null 2>&1; then SUDO=""; else SUDO="sudo"; fi
if docker compose version >/dev/null 2>&1 || sudo docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "No se encontró Docker Compose."; exit 1
fi

echo "==> Deteniendo contenedores..."
$SUDO $COMPOSE down

echo "==> Hecho. La URL pública deja de funcionar (los contenedores están apagados)."
echo "    Los datos de laboratorio se conservan en el volumen 'lab-data'."
