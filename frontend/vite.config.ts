import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const frontendDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(frontendDir, '..'), '');
  const apiTarget = `http://127.0.0.1:${env.PORT || '3000'}`;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/reality': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 5173,
      proxy: {
        '/reality': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
