#!/usr/bin/env bash
# Despliegue del laboratorio en un solo comando (compatible con Kali Linux).
#   bash scripts/deploy.sh
#
# Hace: instala Docker desde el repositorio de Kali (NO get.docker.com, que falla
# en Kali por el codename 'kali-rolling'), construye la imagen, levanta la app y
# el túnel, imprime la URL pública y deja la consola mostrando los intentos.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }

# --- 1) Docker (desde el repo de Kali, no get.docker.com) ---
if ! have docker; then
  echo "==> Docker no está instalado. Instalando desde el repositorio de Kali..."
  # Por si un intento previo con get.docker.com dejó el repo roto:
  sudo rm -f /etc/apt/sources.list.d/docker.list /etc/apt/sources.list.d/docker.sources
  sudo apt-get update
  sudo apt-get install -y docker.io
  # Compose v2 (plugin) si existe; si no, el docker-compose clásico.
  sudo apt-get install -y docker-compose-v2 2>/dev/null \
    || sudo apt-get install -y docker-compose 2>/dev/null \
    || true
  sudo systemctl enable --now docker 2>/dev/null || sudo service docker start 2>/dev/null || true
  sudo usermod -aG docker "$USER" 2>/dev/null || true
  echo "    (Añadido al grupo 'docker'. Si algo falla por permisos, esta sesión usa sudo automáticamente.)"
fi

# --- 2) Elegir cómo invocar docker y compose ---
if docker info >/dev/null 2>&1; then
  SUDO=""
elif sudo docker info >/dev/null 2>&1; then
  SUDO="sudo"
else
  echo "ERROR: no se puede hablar con el demonio de Docker."
  echo "Prueba:  sudo systemctl start docker"
  exit 1
fi

if docker compose version >/dev/null 2>&1 || sudo docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif have docker-compose; then
  COMPOSE="docker-compose"
else
  echo "ERROR: no se encontró 'docker compose' ni 'docker-compose'."
  echo "Instala:  sudo apt install -y docker-compose-v2"
  exit 1
fi

compose() { $SUDO $COMPOSE "$@"; }

# --- 3) Levantar el laboratorio + túnel ---
echo "==> Construyendo y levantando (puede tardar la primera vez)..."
compose up -d --build

# --- 4) Esperar y mostrar la URL pública ---
echo "==> Esperando a que Cloudflare Tunnel genere la URL..."
URL=""
for _ in $(seq 1 30); do
  URL="$(compose logs tunnel 2>/dev/null | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1 || true)"
  [ -n "$URL" ] && break
  sleep 2
done

echo
echo "======================================================"
if [ -n "$URL" ]; then
  echo " URL pública del laboratorio: $URL"
else
  echo " Aún no hay URL. Mira los logs con: $SUDO $COMPOSE logs tunnel"
fi
echo " App local:                   http://127.0.0.1:3000"
echo " Detener todo:                bash scripts/stop.sh"
echo "======================================================"
echo

# --- 5) Consola en vivo (intentos de login, SIN contraseñas) ---
compose logs -f fakelogin
