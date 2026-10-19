import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { config } from './config.js';

// Cuentas 100% ficticias para la práctica. NO son credenciales reales.
export const DEMO_USERS = [
  { username: 'ana', email: 'ana@demo.local', displayName: 'Ana (demo)', password: 'Demo1234' },
  { username: 'luis', email: 'luis@demo.local', displayName: 'Luis (demo)', password: 'Password123' },
  { username: 'invitado', email: 'invitado@demo.local', displayName: 'Invitado (demo)', password: 'invitado' }
];

export function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM users').get();
  if (c > 0) {
    console.log(`[lab] Usuarios existentes: ${c}`);
    return { inserted: 0, total: c };
  }

  const insert = db.prepare(
    `INSERT INTO users (username, email, display_name, password_hash, created_at)
     VALUES (@username, @email, @displayName, @passwordHash, @createdAt)`
  );

  const now = new Date().toISOString();
  const tx = db.transaction((users) => {
    for (const u of users) {
      insert.run({
        username: u.username,
        email: u.email,
        displayName: u.displayName,
        passwordHash: bcrypt.hashSync(u.password, config.bcryptRounds),
        createdAt: now
      });
    }
  });

  tx(DEMO_USERS);
  console.log(`[lab] Usuarios ficticios listos: ${DEMO_USERS.length}`);
  return { inserted: DEMO_USERS.length, total: DEMO_USERS.length };
}

// Permite ejecutarlo suelto: `npm run seed` / `node src/seed.js --run`
if (process.argv.includes('--run')) {
  const { initSchema } = await import('./db.js');
  initSchema();
  seedIfEmpty();
}
