import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const indexFile = path.join(publicDir, 'index.html');

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      // El laboratorio local se sirve por HTTP en 127.0.0.1. Quitamos
      // 'upgrade-insecure-requests' para que el navegador no intente forzar
      // HTTPS en el entorno local; el cifrado real lo aporta el túnel (Stage 3).
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'upgrade-insecure-requests': null
        }
      }
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        // Sin Origin (curl, navegación directa, server-to-server): permitir.
        if (!origin) return callback(null, true);
        // Origen explícitamente permitido (p. ej. el frontend de desarrollo).
        if (config.allowedOrigins.includes(origin)) return callback(null, true);
        // Cualquier otro origen: NO lanzar error (eso provocaba un 500 que rompía
        // también las peticiones same-origin del túnel). Simplemente no añadimos
        // cabeceras CORS: las peticiones same-origin funcionan igual y las
        // cross-origin no autorizadas las bloquea el navegador.
        return callback(null, false);
      },
      credentials: false
    })
  );

  app.use(express.json({ limit: '10kb' }));

  // 1) API
  app.get('/api', (req, res) => {
    res.json({
      name: 'Laboratorio de autenticación web (demo educativa)',
      isDemo: true,
      warning: 'No introduzcas credenciales reales en este entorno.',
      endpoints: ['GET /api/health', 'POST /api/login', 'GET /api/events']
    });
  });
  app.use('/api', healthRouter);
  app.use('/api', authRouter);

  // Cualquier ruta /api no reconocida responde JSON (nunca el index.html).
  app.use('/api', (req, res) => {
    res.status(404).json({ ok: false, message: 'Recurso de API no encontrado.' });
  });

  // 2) Frontend compilado (client -> server/public)
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // 3) Fallback SPA: cualquier otra ruta devuelve index.html
  app.get('*', (req, res, next) => {
    if (fs.existsSync(indexFile)) {
      return res.sendFile(indexFile);
    }
    return next();
  });

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      message:
        'Interfaz no compilada. Ejecuta "cd client && npm run build" para generar server/public.'
    });
  });

  // Manejo de errores: nunca expone el stack al cliente.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[lab:error]', err.message);
    res.status(500).json({ ok: false, message: 'Error interno del laboratorio.' });
  });

  return app;
}
