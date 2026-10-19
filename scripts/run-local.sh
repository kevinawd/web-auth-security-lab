#!/usr/bin/env bash
# Laboratorio SIN Docker: usa Node (via nvm si hace falta) y el binario de
# cloudflared descargado directamente. No toca apt.
#
#   bash scripts/run-local.sh
#
# Detener: Ctrl+C (apaga servidor y túnel).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# --- 1) Node + npm (sin apt): usa los instalados o nvm ---
# Comprobamos npm (no node): en Kali el paquete 'nodejs' puede venir sin npm.
if ! command -v npm >/dev/null 2>&1; then
  echo "==> npm no encontrado. Instalando nvm + Node LTS (incluye npm, sin apt)..."
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
else
  echo "==> Node $(node -v), npm $(npm -v)"
fi

# --- 2) Dependencias y build ---
echo "==> Instalando dependencias (backend + frontend)..."
npm run install:all
echo "==> Compilando el frontend..."
npm run build

# --- 3) cloudflared (binario directo, sin apt) ---
case "$(uname -m)" in
  x86_64|amd64) CF_ARCH="amd64" ;;
  aarch64|arm64) CF_ARCH="arm64" ;;
  *) echo "Arquitectura no soportada: $(uname -m)"; exit 1 ;;
esac

CF_DIR="$HOME/.local/bin"
CF="$CF_DIR/cloudflared"
mkdir -p "$CF_DIR"
if [ ! -x "$CF" ]; then
  echo "==> Descargando cloudflared ($CF_ARCH)..."
  curl -fsSL -o "$CF" \
    "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$CF_ARCH"
  chmod +x "$CF"
fi

# --- 4) Servidor en segundo plano ---
echo "==> Arrancando el laboratorio en http://127.0.0.1:3000 ..."
npm start > /tmp/fakelogin.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" "${TUNNEL_PID:-}" 2>/dev/null || true' EXIT
sleep 4

# --- 5) Túnel en segundo plano + URL ---
echo "==> Levantando Cloudflare Tunnel..."
"$CF" tunnel --no-autoupdate --url http://127.0.0.1:3000 > /tmp/fakelogin-tunnel.log 2>&1 &
TUNNEL_PID=$!

URL=""
for _ in $(seq 1 30); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/fakelogin-tunnel.log | tail -1 || true)"
  [ -n "$URL" ] && break
  sleep 2
done

echo
echo "======================================================"
if [ -n "$URL" ]; then
  echo " URL pública del laboratorio: $URL"
else
  echo " Sin URL todavía. Revisa: /tmp/fakelogin-tunnel.log"
fi
echo " App local:                   http://127.0.0.1:3000"
echo " Detener:                     Ctrl+C"
echo "======================================================"
echo

# --- 6) Consola en vivo (intentos de login, SIN contraseñas) ---
tail -f /tmp/fakelogin.log
