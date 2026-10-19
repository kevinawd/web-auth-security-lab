#!/usr/bin/env bash
# Túnel RÁPIDO de Cloudflare (sin cuenta, sin dominio).
# Genera una URL temporal https://xxxx.trycloudflare.com que apunta a tu :3000.
#
# Uso:  bash scripts/tunnel-quick.sh
# Detener: Ctrl+C (la URL deja de funcionar de inmediato).
#
# ADVERTENCIA: con este modo la demo queda abierta a Internet. Es apto solo para
# pruebas cortas y controladas. Para acceso restringido usa scripts/tunnel-named.sh
set -euo pipefail

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared no está instalado. Instálalo con:"
  echo "  sudo apt install -y cloudflared   # o descarga el .deb oficial"
  exit 1
fi

echo "Iniciando túnel rápido hacia http://127.0.0.1:3000 ..."
echo "Copia la URL https://*.trycloudflare.com que aparezca abajo."
exec cloudflared tunnel --url http://127.0.0.1:3000
