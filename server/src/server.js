import { config } from './config.js';
import { createApp } from './app.js';
import { initSchema } from './db.js';
import { seedIfEmpty } from './seed.js';

initSchema();
seedIfEmpty();

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log('----------------------------------------------------');
  console.log(' Laboratorio de login (DEMO EDUCATIVA)');
  console.log(` Servidor:   http://${config.host}:${config.port}`);
  console.log(` Entorno:    ${config.nodeEnv}`);
  console.log(' Recuerda:   no introduzcas credenciales reales.');
  console.log('----------------------------------------------------');
});

function shutdown(signal) {
  console.log(`\n[lab] Recibida señal ${signal}. Cerrando...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
