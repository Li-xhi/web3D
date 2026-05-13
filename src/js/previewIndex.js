/**
 * MVC — Controller 层（index.html 入口）
 * 负责：扫描页面上所有 .console-preview-canvas 元素，
 *       为每张卡片初始化一个 3D 模型预览。
 *
 * 该入口本身不渲染 UI，仅触发预览模块的初始化。
 */

import { consoles, findConsoleById } from './model/consoles.js';
import { initPreview } from './previewViewer.js';

document.querySelectorAll('canvas.console-preview-canvas').forEach((canvas) => {
  const id = canvas.dataset.consoleId;
  const data = findConsoleById(id);
  if (!data) {
    console.warn('[previewIndex] 未知 console id:', id);
    return;
  }
  initPreview(canvas, data);
});

console.info('[previewIndex] 初始化主页预览，共', consoles.length, '台掌机');
