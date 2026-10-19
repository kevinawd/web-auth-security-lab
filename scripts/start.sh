#!/usr/bin/env bash
# Elige automáticamente cómo levantar el laboratorio:
#   - Si Docker está disponible y funcionando  -> scripts/deploy.sh   (con túnel)
#   - Si no                                     -> scripts/run-local.sh (con túnel)
#
#   bash scripts/start.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

docker_ok() {
  command -v docker >/dev/null 2>&1 || return 1
  docker info >/dev/null 2>&1 || sudo docker info >/dev/null 2>&1
}

if docker_ok; then
  echo "==> Docker disponible: levanto con contenedores (deploy.sh)."
  exec bash "$SCRIPT_DIR/deploy.sh"
else
  echo "==> Docker no disponible: levanto en local con Node (run-local.sh)."
  exec bash "$SCRIPT_DIR/run-local.sh"
fi
