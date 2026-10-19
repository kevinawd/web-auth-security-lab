import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const dbPath = path.isAbsolute(config.dbFile)
  ? config.dbFile
  : path.resolve(serverRoot, config.dbFile);

for (const suffix of ['', '-wal', '-shm', '-journal']) {
  const file = dbPath + suffix;
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.log(`[lab] Eliminado ${file}`);
  }
}

console.log('[lab] Recreando esquema y datos ficticios...');
spawnSync(process.execPath, [path.resolve(__dirname, 'seed.js'), '--run'], {
  stdio: 'inherit'
});
console.log('[lab] Base de datos del laboratorio reiniciada.');
