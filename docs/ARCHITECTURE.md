# Arquitectura del laboratorio

## 1. Diagrama de componentes

```
┌────────────────────┐   HTTP (JSON)   ┌───────────────────────┐   SQL    ┌────────────┐
│  Navegador         │ ──────────────▶ │  Servidor Express     │ ───────▶ │  SQLite    │
│  React + Tailwind  │ ◀────────────── │  (Node.js, :3000)     │ ◀─────── │  lab.sqlite│
└────────────────────┘   JSON resp.     └───────────────────────┘          └────────────┘
          ▲                                       ▲
          │                                       │
   [ Cloudflare Tunnel ] ────────────────▶ 127.0.0.1:3000   (Stage 3)
```

## 2. Flujo de datos paso a paso (lo que hay que explicar en el informe)

1. El usuario escribe `identifier` y `password` en el formulario del navegador.
2. El frontend construye un cuerpo JSON y hace `fetch('/api/login', { method:'POST', ... })`.
3. El navegador abre una conexión TCP al host:puerto del backend y envía:
   - una **línea de petición**: `POST /api/login HTTP/1.1`
   - **cabeceras**: `Content-Type: application/json`, `User-Agent`, `Content-Length`, etc.
   - un **cuerpo**: `{"identifier":"...","password":"..."}`.
4. Express recibe la petición; el middleware `express.json()` parsea el cuerpo.
5. `zod` valida la forma y los límites de los campos.
6. La lógica consulta SQLite buscando ese usuario ficticio.
7. Se compara la contraseña **solo en memoria** contra un *hash* `bcrypt` almacenado.
   La contraseña escrita **no se guarda ni se registra en logs**.
8. Se inserta un evento de auditoría con `has_password = true/false` (nunca el valor).
9. Express responde con JSON y un código de estado (`200` o `401`).
10. El navegador interpreta la respuesta y muestra el mensaje al usuario.

> Punto clave: en HTTP "clásico" todo esto viaja en texto claro. Solo **HTTPS (TLS)**
> cifra el canal. Ver `docs/04-seguridad.md` (Stage 4).

## 3. Modelo de datos (solo datos ficticios)

**users** (usuarios de demostración)

| campo          | tipo    | nota                                   |
|----------------|---------|----------------------------------------|
| id             | INTEGER | PK                                     |
| username       | TEXT    | único                                  |
| email          | TEXT    | único                                  |
| display_name   | TEXT    | para el saludo en pantalla             |
| password_hash  | TEXT    | `bcrypt`, **nunca** texto plano        |
| created_at     | TEXT    | ISO 8601                               |

**login_events** (auditoría sin secretos)

| campo                | tipo    | nota                              |
|----------------------|---------|-----------------------------------|
| id                   | INTEGER | PK                                |
| identifier_attempted | TEXT    | lo que se escribió (ficticio)     |
| has_password         | INTEGER | 0/1 — **indicador booleano**      |
| success              | INTEGER | 0/1                               |
| ip                   | TEXT    | dirección de origen               |
| user_agent           | TEXT    | cabecera del cliente              |
| created_at           | TEXT    | ISO 8601                          |

## 4. Endpoints (Stage 1)

| Método | Ruta           | Descripción                                   |
|--------|----------------|-----------------------------------------------|
| GET    | `/`            | Banner JSON que confirma que es una demo      |
| GET    | `/api/health`  | Estado del servicio (sin secretos)            |
| POST   | `/api/login`   | Procesa el formulario (valida y responde)     |
| GET    | `/api/events`  | Últimos eventos de auditoría (sin secretos)   |

## 5. Controles de seguridad ya aplicados (Stage 1)

- **Cabeceras** seguras con `helmet` (oculta `X-Powered-By`, CSP base, etc.).
- **Límite de tasa** con `express-rate-limit` en `/api/login` (anti fuerza bruta).
- **Límite de tamaño** del cuerpo JSON (`10kb`).
- **Validación de entradas** con `zod` (tipos y longitudes).
- **Mensajes de error genéricos** (evita enumeración de usuarios).
- **Hash de contraseñas** con `bcrypt` para los usuarios de prueba.
- **Registro sin secretos**: solo el booleano `has_password`.
- **CORS restringido** a los orígenes del laboratorio.

## 6. Por qué esto NO debe usarse tal cual en producción

Es un laboratorio. En producción faltarían: HTTPS obligatorio, gestión de sesiones/tokens
segura, almacén de secretos, protección CSRF, verificación de correo, políticas de
contraseñas, monitorización, backups cifrados, etc.
