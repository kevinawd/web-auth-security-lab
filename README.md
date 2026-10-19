# Laboratorio de autenticación web (demo educativa)

> **Aviso:** este proyecto es **exclusivamente educativo**. La página se identifica
> siempre como una **simulación**. No debe usarse con credenciales, datos ni servicios
> reales. El backend **nunca guarda contraseñas**; solo registra si el campo tenía valor
> (`has_password = true/false`).

## Objetivo

Estudiar, en un entorno controlado (Kali Linux), cómo funcionan:

- la estructura de una página de inicio de sesión;
- el envío de formularios por HTTP (frontend → backend → base de datos);
- el almacenamiento seguro de contraseñas mediante *hash*;
- la exposición temporal de un servicio local con Cloudflare Tunnel;
- los riesgos de suplantación, captura de datos y publicación de servicios.

## Tecnologías

| Capa        | Stack                                   |
|-------------|-----------------------------------------|
| Frontend    | React + TypeScript + Tailwind CSS (Vite)|
| Backend     | Node.js + Express                       |
| Persistencia| SQLite (`better-sqlite3`)               |
| Seguridad   | `helmet`, `express-rate-limit`, `zod`, `bcryptjs` |
| Exposición  | Cloudflare Tunnel (`cloudflared`)       |
| Control de versiones | Git                            |

## Estructura del repositorio

```
fakelogin/
├─ server/            # API Express + SQLite + sirve el frontend compilado
│  ├─ src/
│  │  ├─ config.js  db.js  seed.js  reset.js  app.js  server.js
│  │  └─ routes/{health.js, auth.js}
│  └─ public/         # (generado por el build del cliente)
├─ client/            # Frontend React + TypeScript + Tailwind (Vite)
│  ├─ src/{main.tsx, App.tsx, types.ts, vite-env.d.ts}
│  ├─ src/components/{Disclaimer.tsx, LoginForm.tsx}
│  ├─ src/lib/api.ts
│  ├─ vite.config.ts  tailwind.config.js  postcss.config.js  tsconfig.json
│  └─ package.json
├─ docs/              # Arquitectura y guías por etapa
├─ scripts/           # deploy.sh, stop.sh, setup-kali.sh, tunnel-*.sh
├─ cloudflared/       # config.yml.example (túnel con nombre)
├─ Dockerfile  docker-compose.yml  docker-compose.named.yml  .dockerignore
├─ LICENSE
└─ package.json       # Scripts de conveniencia (install:all, build, start)
```

## Puesta en marcha rápida (Stages 1 y 2)

```bash
npm run install:all          # instala backend y frontend

# Opción A - desarrollo (dos terminales)
npm run dev:server           # API en http://127.0.0.1:3000
npm run dev:client           # UI en http://127.0.0.1:5173

# Opción B - producción local (un solo servicio)
npm run build                # compila el frontend en server/public
npm start                    # todo en http://127.0.0.1:3000
```

Pruebas de API:

```bash
curl http://127.0.0.1:3000/api/health
curl -X POST http://127.0.0.1:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"ana@demo.local","password":"Demo1234"}'
```

## Despliegue con Docker — un solo comando (recomendado)

```bash
bash scripts/deploy.sh
```

Eso instala Docker si falta, construye la imagen, levanta la app **y el túnel**, y
te muestra una URL pública `https://*.trycloudflare.com` seguida de los intentos de
login en vivo. Para detener todo:

```bash
bash scripts/stop.sh
```

Equivalente manual:

```bash
docker compose up -d --build     # app + túnel
docker compose logs tunnel       # ver la URL pública
docker compose logs -f fakelogin # consola en vivo (sin contraseñas)
docker compose down              # detener
```

La imagen incluye el frontend ya compilado: no hace falta clonar ni compilar nada
para ejecutarla.

> El túnel rápido deja la demo accesible a quien tenga la URL. Para restringirlo a
> tu cuenta usa el túnel con nombre + Cloudflare Access
> (`docker-compose.named.yml`, ver `docs/03-cloudflare-tunnel.md`).

## Publicar con Cloudflare Tunnel

```bash
bash scripts/tunnel-quick.sh     # URL temporal https://*.trycloudflare.com
```

Para acceso restringido (solo tú) con dominio propio: `bash scripts/tunnel-named.sh`
y protege el hostname con **Cloudflare Access**. Guía completa en
`docs/03-cloudflare-tunnel.md`.

## Log en consola

Cada intento se imprime en la consola del servidor **sin la contraseña**:

```
[22:06:20] intento ana@demo.local | contraseña: SÍ presente | ACCESO CORRECTO (127.0.0.1)
[22:06:21] intento ana@demo.local | contraseña: SÍ presente | RECHAZADO (127.0.0.1)
```

## Subir el proyecto a Git

```bash
git init
git add .
git commit -m "Laboratorio educativo de autenticación web"
git branch -M main
git remote add origin <URL_DE_TU_REPO>
git push -u origin main
```

## Hoja de ruta

- **Stage 1 – Entorno y backend base.** (hecho)
- **Stage 2 – Frontend React + TS + Tailwind.** (hecho)
- **Stage 3 – Cloudflare Tunnel.** (hecho)
- **Stage 4 – Pruebas de seguridad y conclusiones.** (hecho)

Ver `docs/ARCHITECTURE.md`, `docs/01-entorno-kali.md`, `docs/02-frontend.md`,
`docs/03-cloudflare-tunnel.md` y `docs/04-seguridad.md`.
