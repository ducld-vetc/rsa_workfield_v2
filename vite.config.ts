import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = 5190;

/** Workfield — Mobile Cứu hộ Tài xế v3.2 — http://127.0.0.1:5190 */
export default defineConfig({
  resolve: {
    alias: {
      '@dls': path.resolve(__dirname, 'dls'),
    },
  },
  server: {
    port: PORT,
    host: '127.0.0.1',
    strictPort: false,
    open: '/',
  },
  preview: {
    port: PORT,
    host: '127.0.0.1',
    strictPort: false,
    open: '/',
  },
  plugins: [
    react(),
    {
      name: 'log-driver-url',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          const addr = server.httpServer?.address();
          const port = typeof addr === 'object' && addr ? addr.port : PORT;
          console.log(`\n  Workfield Driver: http://127.0.0.1:${port}/\n`);
        });
      },
    },
  ],
});
