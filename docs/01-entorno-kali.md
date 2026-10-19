# Stage 1 — Preparación del entorno en Kali Linux

## 0. Requisitos

- Kali Linux actualizado (VM con NAT o red interna).
- ~2 GB de disco libre.
- Cuenta de usuario normal (no root) para desarrollar.

## 1. Actualizar el sistema

```bash
sudo apt update && sudo apt full-upgrade -y
```

## 2. Instalar herramientas base

```bash
sudo apt install -y git curl build-essential ca-certificates
```

## 3. Instalar Node.js (v20 LTS) con NodeSource

> Kali suele traer Node viejo. Instalamos el LTS 20.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v      # debe mostrar v20.x
npm -v
```

Alternativa con `nvm` (recomendada si no quieres tocar el sistema):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

## 4. Copiar el proyecto a la VM

Opciones:

- **Carpeta compartida** de la VM (VMware/VirtualBox) → cópialo con `cp -r`.
- **USB / disco**.
- **scp** desde el host (SSH habilitado en Kali):

```bash
# En la VM Kali, habilitar SSH:
sudo systemctl enable --now ssh
# Desde tu equipo (ajusta usuario/IP):
scp -r fakelogin usuario@IP_DE_KALI:~/
```

- **Git** (si subes el repo a un remoto):

```bash
git clone <URL_DEL_REPO> fakelogin
```

## 5. Instalar dependencias del backend

```bash
cd ~/fakelogin/server
cp .env.example .env
npm install
```

Si `better-sqlite3` intenta compilar y falla:

```bash
sudo apt install -y python3 make g++
npm rebuild better-sqlite3
```

## 6. Arrancar el backend

```bash
npm run dev          # con recarga automática
# o
npm start
```

Verás algo como:

```
[lab] Usuarios ficticios listos: 3
[lab] Servidor en http://127.0.0.1:3000 (NODE_ENV=development)
```

## 7. Pruebas rápidas (con curl)

```bash
# Estado del servicio
curl -s http://127.0.0.1:3000/api/health | python3 -m json.tool

# Login correcto (usuario ficticio)
curl -s -X POST http://127.0.0.1:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"ana@demo.local","password":"Demo1234"}' | python3 -m json.tool

# Login fallido
curl -s -X POST http://127.0.0.1:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"ana@demo.local","password":"incorrecta"}' | python3 -m json.tool

# Datos inválidos -> 400
curl -s -X POST http://127.0.0.1:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"a"}' | python3 -m json.tool

# Eventos registrados (sin contraseñas)
curl -s http://127.0.0.1:3000/api/events | python3 -m json.tool
```

## 8. Errores habituales y solución

| Síntoma | Causa | Solución |
|---|---|---|
| `EADDRINUSE` | Puerto 3000 ocupado | `sudo ss -ltnp \| grep 3000` y mata el proceso, o cambia `PORT` en `.env` |
| `Cannot find module better-sqlite3` | no compilado | `npm rebuild better-sqlite3` |
| `node: command not found` | Node no instalado | repetir paso 3 |
| `curl: (7) Failed to connect` | el server no está corriendo o host distinto | revisa que `HOST=127.0.0.1` y que el proceso siga vivo |
| Permisos al abrir la DB | carpeta `data/` | se crea sola; revisa permisos de `~/fakelogin/server` |

## 9. Evidencias para el informe (Stage 1)

1. `node -v` y `npm -v`.
2. Salida de `npm install` terminando sin errores.
3. Log de arranque del servidor.
4. Salida JSON de `/api/health`.
5. Login correcto (200) y fallido (401) con `curl`.
6. Salida de `/api/events` mostrando `has_password` pero **sin** contraseñas.
