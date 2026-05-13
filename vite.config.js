import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // assets/ 目录内容在开发/构建时直接暴露在根路径
  publicDir: 'assets',

  /* 相对路径打包：让构建结果可以放在任意子路径下（例如学校服务器的 ~userid/）
     而不必修改 base。HTML 中的资源引用会变成 "./assets/xxx.js" 而非 "/assets/xxx.js"。 */
  base: './',

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
