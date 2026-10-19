import { Router } from 'express';
import { db } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  res.json({
    ok: true,
    service: 'fakelogin-lab',
    isDemo: true,
    warning: 'Entorno educativo. No uses credenciales reales.',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    uptimeSeconds: Math.round(process.uptime()),
    users: users,
    timestamp: new Date().toISOString()
  });
});
