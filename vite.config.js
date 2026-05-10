import { defineConfig } from 'vite';

export default defineConfig({
  // 静态资源目录，assets/ 中的文件会被直接提供
  publicDir: 'assets',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
