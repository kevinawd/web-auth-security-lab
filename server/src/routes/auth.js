import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { logLoginEvent } from '../logger.js';

export const authRouter = Router();

// Control básico anti fuerza bruta.
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos. Espera un minuto (límite del laboratorio).'
  }
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'mínimo 3 caracteres').max(120, 'máximo 120 caracteres'),
  password: z.string().min(1, 'la contraseña no puede estar vacía').max(200, 'máximo 200 caracteres')
});

authRouter.post('/login', loginLimiter, (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: 'Datos incompletos o inválidos.',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  const { identifier, password } = parsed.data;

  // IMPORTANTE: nunca guardamos la contraseña. Solo un indicador booleano.
  const hasPassword = password.length > 0;

  const user = db
    .prepare(
      `SELECT id, username, email, display_name, password_hash
       FROM users
       WHERE email = ? OR username = ?
       LIMIT 1`
    )
    .get(identifier, identifier.toLowerCase());

  let success = false;
  if (user) {
    success = bcrypt.compareSync(password, user.password_hash);
  }

  db.prepare(
    `INSERT INTO login_events (identifier_attempted, has_password, success, ip, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    identifier,
    hasPassword ? 1 : 0,
    success ? 1 : 0,
    req.ip ?? null,
    req.get('user-agent') ?? null,
    new Date().toISOString()
  );

  // Efecto "consola en vivo". El valor de la contraseña NUNCA se registra.
  logLoginEvent({ identifier, hasPassword, success, ip: req.ip });

  if (success) {
    return res.json({
      ok: true,
      isDemo: true,
      message: `Acceso de demostración concedido. ¡Hola, ${user.display_name}!`,
      user: {
        username: user.username,
        email: user.email,
        displayName: user.display_name
      }
    });
  }

  // Mensaje genérico: no revelamos si el usuario existe (evita enumeración).
  return res.status(401).json({
    ok: false,
    message: 'Verifique su nombre de usuario o contraseña, y vuelva a intentarlo.'
  });
});

// Vista de auditoría SIN secretos: solo el booleano has_password.
authRouter.get('/events', (req, res) => {
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);

  const events = db
    .prepare(
      `SELECT id, identifier_attempted, has_password, success, ip, user_agent, created_at
       FROM login_events
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(limit);

  res.json({
    ok: true,
    isDemo: true,
    note: 'Auditoría de laboratorio. No se almacena ninguna contraseña.',
    count: events.length,
    events: events.map((e) => ({
      ...e,
      has_password: Boolean(e.has_password),
      success: Boolean(e.success)
    }))
  });
});
