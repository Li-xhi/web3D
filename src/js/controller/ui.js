/**
 * MVC — Controller 层
 * 负责：UI 按钮事件绑定（掌机切换、相机预设、wireframe、灯光、翻盖）
 *       不直接操作 Three.js 对象，通过回调委托给 main.js
 */

import { consoles } from '../model/consoles.js';

/**
 * 绑定所有 UI 事件
 * @param {object} callbacks - 各按钮的回调函数集合
 */
export function bindUI(callbacks) {
  bindConsoleButtons(callbacks.onConsoleSwitch);
  bindWireframeButton(callbacks.onWireframeToggle);
  bindLightButton(callbacks.onLightToggle);
  bindBgmButton(callbacks.onBgmToggle);
  bindFlipButton(callbacks.onFlip);
}

/** 掌机切换按钮 */
function bindConsoleButtons(onSwitch) {
  const buttons = document.querySelectorAll('.btn-console');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.console;
      // 更新 active 状态
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const consoleData = consoles.find((c) => c.id === id);
      if (consoleData) onSwitch?.(consoleData);
    });
  });
}

/** wireframe 切换按钮 */
function bindWireframeButton(onToggle) {
  const btn = document.getElementById('btn-wireframe');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOn = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!isOn));
    onToggle?.(!isOn);
  });
}

/** 主光源开关按钮 */
function bindLightButton(onToggle) {
  const btn = document.getElementById('btn-light');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOn = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!isOn));
    onToggle?.(!isOn);
  });
}

/** BGM 播放/暂停按钮 */
function bindBgmButton(onToggle) {
  const btn = document.getElementById('btn-bgm');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOn = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', String(!isOn));
    onToggle?.(!isOn);
  });
}

/** GBA SP 翻盖按钮 */
function bindFlipButton(onFlip) {
  const btn = document.getElementById('btn-flip');
  if (!btn) return;
  let isOpen = false;
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    onFlip?.(isOpen);
  });
}

/**
 * 根据当前掌机数据更新相机预设按钮（动态生成）
 * @param {object} consoleData
 * @param {function} onPresetClick
 */
export function updateCameraPresets(consoleData, onPresetClick) {
  const container = document.getElementById('camera-presets');
  if (!container) return;
  container.innerHTML = '';

  consoleData.cameraPresets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-camera' + (index === 0 ? ' active' : '');
    btn.textContent = preset.name;
    btn.setAttribute('aria-label', `切换到${preset.name}视角`);
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-camera').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onPresetClick?.(preset);
    });
    container.appendChild(btn);
  });
}

/**
 * 更新展品信息面板文字
 * @param {object} consoleData
 */
export function updateConsoleInfo(consoleData) {
  const nameEl = document.getElementById('info-name');
  const yearEl = document.getElementById('info-year');
  const descEl = document.getElementById('info-desc');

  if (nameEl) nameEl.textContent = `${consoleData.manufacturer} ${consoleData.name}`;
  if (yearEl) yearEl.textContent = `${consoleData.year} 年`;
  if (descEl) descEl.textContent = consoleData.description;
}

/**
 * 控制翻盖按钮的显示/隐藏（仅 GBA SP 显示）
 * @param {boolean} show
 */
export function toggleFlipButton(show) {
  const btn = document.getElementById('btn-flip');
  if (!btn) return;
  btn.classList.toggle('d-none', !show);
}

/** 显示/隐藏加载遮罩 */
export function setLoadingVisible(visible, text = '正在加载展品…') {
  const overlay = document.getElementById('loading-overlay');
  const textEl = document.getElementById('loading-text');
  if (!overlay) return;
  if (textEl) textEl.textContent = text;
  overlay.classList.toggle('hidden', !visible);
}
