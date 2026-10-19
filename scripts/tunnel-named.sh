#!/usr/bin/env bash
# Túnel con nombre (requiere cuenta Cloudflare + dominio) y, recomendado,
# un hostname protegido con Cloudflare Access.
#
# Uso:
#   1) edita las variables de abajo
#   2) bash scripts/tunnel-named.sh
#
# Detener: Ctrl+C  (o: cloudflared tunnel stop LAB_TUNNEL)
set -euo pipefail

TUNNEL_NAME="${TUNNEL_NAME:-fakelogin-lab}"
HOSTNAME_FQDN="${HOSTNAME_FQDN:-lab.tudominio.com}"   # <-- cambia esto
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3000}"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Instala cloudflared primero (ver docs/03-cloudflare-tunnel.md)."
  exit 1
fi

echo "==> Autenticando (abrirá el navegador)..."
cloudflared tunnel login

echo "==> Creando túnel '$TUNNEL_NAME' (si ya existe, se ignora el error)..."
cloudflared tunnel create "$TUNNEL_NAME" || true

echo "==> Asociando $HOSTNAME_FQDN -> $LOCAL_URL ..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME_FQDN" || true

echo "==> Arrancando el túnel. Recuerda proteger $HOSTNAME_FQDN con Cloudflare Access."
exec cloudflared tunnel run --url "$LOCAL_URL" "$TUNNEL_NAME"
