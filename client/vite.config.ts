import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend de desarrollo (Vite, :5173) redirige /api al backend (:3000)
// mediante un proxy, para que no haya problemas de CORS durante la práctica.
// El build de producción se genera directamente en server/public y lo sirve Express.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true,
    // Sin polyfill inline: así el CSP por defecto de helmet (script-src 'self') es suficiente.
    modulePreload: { polyfill: false }
  }
});
