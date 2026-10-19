#!/usr/bin/env bash
# Stage 1 - Preparación del entorno de laboratorio en Kali Linux.
# Uso:  bash scripts/setup-kali.sh
set -euo pipefail

echo "==> Actualizando índices de apt..."
sudo apt update

echo "==> Instalando herramientas base..."
sudo apt install -y git curl build-essential ca-certificates python3 make g++

if ! command -v node >/dev/null 2>&1; then
  echo "==> Instalando Node.js 20 LTS (NodeSource)..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "==> Versiones:"
node -v
npm -v

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "==> Instalando dependencias del backend..."
cd "$ROOT_DIR/server"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "    creado server/.env desde .env.example"
fi
npm install

echo "==> Listo. Arranca con:  cd server && npm run dev"
