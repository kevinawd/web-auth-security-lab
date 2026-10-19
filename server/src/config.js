import 'dotenv/config';

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value, fallback) {
  const raw = (value ?? '').trim();
  if (!raw) return fallback;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: toInt(process.env.PORT, 3000),
  host: process.env.HOST ?? '127.0.0.1',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dbFile: process.env.DB_FILE ?? 'data/lab.sqlite',
  allowedOrigins: toList(process.env.ALLOWED_ORIGINS, [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ]),
  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 10)
};

export const isProduction = config.nodeEnv === 'production';
