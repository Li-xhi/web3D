import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // assets/ 目录内容在开发/构建时直接暴露在根路径
  publicDir: 'assets',

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
    // 多页面入口：每个 HTML 文件单独构建
    rollupOptions: {
      input: {
        index:   resolve(__dirname, 'index.html'),
        gameboy: resolve(__dirname, 'gameboy.html'),
        gba_sp:  resolve(__dirname, 'gba_sp.html'),
        psp:     resolve(__dirname, 'psp.html'),
        about:   resolve(__dirname, 'about.html'),
      },
    },
  },
});
