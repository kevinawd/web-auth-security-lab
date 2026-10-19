# Stage 3 — Cloudflare Tunnel (acceso remoto controlado)

## Qué construimos y por qué

Publicar el laboratorio (que corre en `127.0.0.1:3000`) en una URL HTTPS temporal
**sin abrir puertos en el router**, para estudiar la diferencia entre red local y
exposición pública, y los riesgos que conlleva. Regla de oro del laboratorio:
**solo datos ficticios** y, siempre que sea posible, **acceso restringido**.

## Conceptos previos

### localhost vs IP privada vs IP pública

| Dirección | Alcance | Quién puede conectarse |
|---|---|---|
| `127.0.0.1` (localhost) | Solo tu VM | Solo procesos de la propia máquina |
| `192.168.x.x` / `10.x.x.x` (privada) | Tu red local | Equipos en tu LAN (según el firewall) |
| IP pública (p. ej. `200.x.x.x`) | Internet | Cualquiera que la alcance y el puerto esté abierto |

El backend escucha en `127.0.0.1`, así que **por defecto nadie de fuera llega**.
Cloudflare Tunnel crea una **conexión saliente** desde tu VM hacia Cloudflare y
revierte el tráfico por ahí: no necesitas abrir puertos.

### Túnel vs. port forwarding (NAT)

- **Port forwarding**: configuras el router para dirigir un puerto público de tu
  IP hacia un equipo interno. Expone el puerto a **toda** Internet y depende de
  que tu IP/ISP lo permitan.
- **NAT**: el mecanismo que traduce direcciones privadas a una pública; sin una
  regla de reenvío, las conexiones entrantes **no** llegan a tu equipo.
- **Cloudflare Tunnel**: no hay puerto abierto ni IP pública; la VM inicia la
  conexión. Además Cloudflare termina el **TLS (HTTPS)** por ti.

> Importante: un túnel **no** añade autenticación por sí solo. Da una URL pública.
> Para restringir el acceso se usa **Cloudflare Access** (ver abajo).

## Instalar cloudflared en Kali

```bash
# Opción 1: repos oficiales
sudo apt update && sudo apt install -y cloudflared

# Opción 2: .deb oficial (si el paquete no está)
cd /tmp
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

cloudflared --version
```

## Primero: levanta el laboratorio

```bash
cd ~/fakelogin
npm run build      # genera server/public
npm start          # http://127.0.0.1:3000
# o con Docker:
# docker compose up -d --build
```

## Opción 0 — Túnel incluido en Docker (lo más simple)

El `docker-compose.yml` ya trae un servicio `tunnel` con el túnel rápido. Un solo
comando levanta app + túnel:

```bash
bash scripts/deploy.sh                     # o: docker compose up -d --build
docker compose logs tunnel                 # muestra la URL trycloudflare.com
```

Para el túnel con nombre + Access dentro de Docker:

```bash
# 1) en Kali, una vez: cloudflared tunnel login && cloudflared tunnel create fakelogin-lab
# 2) copia cloudflared/config.yml.example -> cloudflared/config.yml y ajusta el dominio
docker compose -f docker-compose.yml -f docker-compose.named.yml up -d --build
```

## Opción A — Túnel rápido (sin cuenta, sin dominio)

Ideal para una prueba corta. Genera una URL efímera.

```bash
bash scripts/tunnel-quick.sh
# equivalente a: cloudflared tunnel --url http://127.0.0.1:3000
```

Cloudflared imprime algo como:

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                            |
|  https://palabras-aleatorias.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

- Comprueba que la URL **es tu laboratorio**: debe verse el aviso
  "SIMULACIÓN EDUCATIVA" y responder en `/api/health` con `"isDemo": true`.
- **Detener**: `Ctrl+C`. La URL muere al instante.
- ⚠️ Cualquiera con la URL puede abrirla. Úsalo pocos minutos y ciérralo.

## Opción B — Túnel con dominio + Cloudflare Access (recomendado)

Requiere una cuenta Cloudflare y un dominio en ella. Así **solo tú** entras.

```bash
bash scripts/tunnel-named.sh
# edita antes TUNNEL_NAME y HOSTNAME_FQDN dentro del script
```

Luego, en el panel de Cloudflare:

1. **Zero Trust → Access → Applications → Add an application → Self-hosted.**
2. Public hostname: `lab.tudominio.com` (el mismo del script).
3. Añade una **policy**: `Allow` para tu correo (p. ej. `tu-correo@dominio.com`).
4. Guarda. Ahora el hostname pide iniciar sesión con tu identidad antes de
   siquiera llegar al laboratorio.

Detener el túnel: `Ctrl+C` o `cloudflared tunnel stop fakelogin-lab`.

## Cómo comprobar que la app publicada es la tuya

```bash
curl -s https://TU-URL/api/health | python3 -m json.tool
```
Debe responder `"service": "fakelogin-lab"` y `"isDemo": true`. Si no coincide,
estás mirando otro servicio o un dominio mal configurado.

## Diferencias con cuenta / dominio (resumen)

| | Túnel rápido | Túnel con nombre |
|---|---|---|
| Cuenta Cloudflare | No | Sí |
| Dominio propio | No | Sí |
| URL estable | No (aleatoria y efímera) | Sí |
| Se puede proteger con Access | No | Sí |
| Uso | Prueba de minutos | Práctica seria / demostración |

## Riesgos de publicar una app de desarrollo

- **Exposición a robots y escáneres** en cuanto la URL es pública.
- **Falta de autenticación** si no usas Access. El túnel no protege por sí solo.
- **Confusión con un servicio real**: por eso el laboratorio se identifica siempre.
- **Datos**: nunca publiques una versión que guarde credenciales reales.
- **Abuso**: alguien podría usar tu URL para otros fines; ciérrala al terminar.

## Evidencias para el informe (Stage 3)

1. Captura de la URL `trycloudflare.com` funcionando.
2. `curl .../api/health` devolviendo `isDemo: true`.
3. (Opción B) Captura de la pantalla de Cloudflare Access pidiendo tu correo.
4. Captura del túnel detenido (la URL ya no responde).
