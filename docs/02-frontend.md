# Stage 2 — Frontend React + TypeScript + Tailwind

## Qué construimos y por qué

La interfaz de login (formulario + mensajes + aviso de simulación). Aprendemos:

- cómo React maneja el estado del formulario;
- cómo se envía una petición `POST` con `fetch`;
- cómo consumir la respuesta JSON del backend;
- cómo separar la URL de la API (proxy de Vite en desarrollo).

## Arquitectura elegida

```
Desarrollo:   Vite (:5173)  --proxy /api-->  Express (:3000)
Producción:   Express (:3000) sirve server/public + /api
```

En desarrollo Vite redirige `/api` al backend (sin problemas de CORS).
El build se genera en `server/public`, así **Express sirve frontend y API juntos
en el mismo origen**: un único servicio para exponer con el túnel en el Stage 3.

## Archivos principales

| Archivo | Rol |
|---|---|
| `client/vite.config.ts` | Puerto, proxy `/api` y salida del build a `server/public` |
| `client/tailwind.config.js` / `postcss.config.js` | Configuración de Tailwind |
| `client/src/App.tsx` | Layout de la página |
| `client/src/components/Disclaimer.tsx` | Aviso de "simulación educativa" |
| `client/src/components/LoginForm.tsx` | Formulario, estados y mensajes |
| `client/src/lib/api.ts` | Petición `fetch` a `/api/login` |
| `client/src/types.ts` | Tipos de la respuesta |

## Comandos exactos (Kali)

```bash
cd ~/fakelogin/client
cp .env.example .env
npm install
```

**Modo desarrollo** (dos terminales):

```bash
# Terminal 1 - backend
cd ~/fakelogin/server && npm run dev

# Terminal 2 - frontend
cd ~/fakelogin/client && npm run dev
# abre http://127.0.0.1:5173
```

**Modo producción** (un solo servicio en :3000):

```bash
cd ~/fakelogin/client && npm run build      # genera ../server/public
cd ../server && npm start                    # abre http://127.0.0.1:3000
```

## Partes importantes del código

- `LoginForm.tsx` guarda `identifier`, `password`, `loading` y `result` con `useState`.
- Al enviar, llama a `login()` de `lib/api.ts` y muestra el mensaje según `result.ok`.
- El botón **Mostrar/Ocultar** solo cambia el `type` del input (no envía nada distinto).
- `Disclaimer.tsx` deja claro que es una simulación y no suplanta a nadie.

## Pruebas

1. **Formulario vacío** → el navegador no envía (validación HTML) o el backend responde 400.
2. **Credenciales correctas** `ana@demo.local` / `Demo1234` → mensaje verde "Acceso concedido".
3. **Contraseña incorrecta** → mensaje rojo "Credenciales no válidas".
4. **Botón "Usar credenciales de demostración"** → rellena los campos.
5. **Backend apagado** → aparece el aviso "No se pudo contactar con el servidor…".
6. **Responsive** → achica la ventana (o F12 → modo móvil); el diseño se adapta.

Comprueba también que en `http://127.0.0.1:3000/api/events` siguen apareciendo los
eventos **con `has_password` pero sin la contraseña**.

## Errores habituales y solución

| Síntoma | Causa | Solución |
|---|---|---|
| Página en blanco tras `npm run build` + `npm start` | build no ejecutado | `cd client && npm run build` |
| `Failed to fetch` en dev | backend apagado o proxy mal | arranca `server`, revisa el puerto 3000 |
| 404 en `/assets/…` | `server/public` desactualizado | vuelve a compilar |
| Estilos sin aplicar | Tailwind mal configurado | revisa `content` en `tailwind.config.js` |
| CORS al llamar directo a :3000 | origen no permitido | usa el proxy o añade el origen a `ALLOWED_ORIGINS` |
| `tsc` marca errores de tipos | cambios incompletos | revisa `LoginResponse` en `types.ts` |

## Evidencias para el informe (Stage 2)

1. Captura del formulario en escritorio y en móvil.
2. Captura del mensaje de éxito (verde) y de error (rojo).
3. Captura del aviso "SIMULACIÓN EDUCATIVA".
4. Salida de `npm run build` (archivos generados en `server/public`).
5. Captura de `/api/events` confirmando que no se guardan contraseñas.
