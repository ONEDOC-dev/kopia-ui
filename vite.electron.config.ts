// electron 빌드 시 사용되는 vite config
import { defineConfig } from 'vite';
import path from "path";
export default defineConfig(() => {
  const __dirname = path.resolve();
  return {
    build: {
      outDir: '.vite/build/electron',
      rollupOptions: {
        external: ['electron', 'fs', 'path'],
        output: {
          format: 'cjs' as const
        }
      },
      sourcemap: true
    },
    server: {
      port: 3000,
      host: 'localhost',
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:51515',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    }
  }
});