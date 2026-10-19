// Registro en consola de los intentos de login del laboratorio.
// IMPORTANTE: NUNCA se imprime el valor de la contraseña. Solo si el campo
// llegó con contenido (hasPassword) o no.
const useColor = Boolean(process.stdout.isTTY);

const c = {
  reset: useColor ? '\x1b[0m' : '',
  green: useColor ? '\x1b[32m' : '',
  red: useColor ? '\x1b[31m' : '',
  cyan: useColor ? '\x1b[36m' : '',
  dim: useColor ? '\x1b[2m' : ''
};

function time() {
  return new Date().toTimeString().slice(0, 8);
}

export function logLoginEvent({ identifier, hasPassword, success, ip }) {
  const passwordState = hasPassword ? 'SÍ presente' : 'vacía';
  const verdict = success ? `${c.green}ACCESO CORRECTO${c.reset}` : `${c.red}RECHAZADO${c.reset}`;
  console.log(
    `${c.dim}[${time()}]${c.reset} ${c.cyan}intento${c.reset} ` +
      `${identifier} ${c.dim}|${c.reset} contraseña: ${passwordState} ` +
      `${c.dim}|${c.reset} ${verdict} ${c.dim}(${ip ?? '-'})${c.reset}`
  );
}

export function logInfo(message) {
  console.log(`${c.dim}[lab]${c.reset} ${message}`);
}
