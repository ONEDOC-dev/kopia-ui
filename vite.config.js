import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import path from "path";

export default defineConfig(() => {
  const __dirname = path.resolve();
  return {
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react(),eslint()],
    test: {
      globals: true,
      environment: 'jsdom',
    },
    server: {
        port: 3000,
        host: 'localhost',
        https: false,
        strictPort: true,
        open: false,
        proxy: {
          '/api': {
            target: 'http://localhost:51515',
            changeOrigin: true,
            secure: false,
          },
          'keycloak-api': {
            target: 'https://auth.onedoc.kr',
            rewrite: (path) => path.replace(/^\/keycloak-api/, '/admin'),
            changeOrigin: true,
            secure: false,
            ws: true
          }
        },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  };
});
