#!/usr/bin/env bash
# Despliegue del laboratorio en un solo comando.
#   bash scripts/deploy.sh
#
# Hace: verifica/instala Docker, construye la imagen, levanta la app y el túnel,
# imprime la URL pública y deja la consola mostrando los intentos de login.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

# --- 1) Docker instalado? ---
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker no está instalado. Instalando (get.docker.com)..."
  curl -fsSL https://get.docker.com | sudo sh
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER" || true
  echo "    Docker instalado. Si tu usuario no está en el grupo 'docker',"
  echo "    cierra la sesión y vuelve a entrar, o usa 'sudo' en el comando de abajo."
fi

# --- 2) Levantar el laboratorio + túnel ---
echo "==> Construyendo y levantando (puede tardar la primera vez)..."
docker compose up -d --build

# --- 3) Esperar y mostrar la URL pública ---
echo "==> Esperando a que Cloudflare Tunnel genere la URL..."
URL=""
for _ in $(seq 1 30); do
  URL="$(docker compose logs tunnel 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
  [ -n "$URL" ] && break
  sleep 2
done

echo
echo "======================================================"
if [ -n "$URL" ]; then
  echo " URL pública del laboratorio: $URL"
else
  echo " Aún no hay URL. Mira los logs con: docker compose logs tunnel"
fi
echo " App local:                   http://127.0.0.1:3000"
echo " Detener todo:                bash scripts/stop.sh"
echo "=================================================================="
echo

# --- 4) Consola en vivo (intentos de login, SIN contraseñas) ---
docker compose logs -f fakelogin
