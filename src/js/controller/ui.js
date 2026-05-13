/**
 * MVC — Controller 层
 * 负责：UI 事件绑定
 *
 * 导出：
 *   bindUI()          — index.html 用（卡片切换 + 场景按钮）
 *   bindSceneButtons()— 展品页 viewer.js 单独调用
 *   updateCameraPresets / updateConsoleInfo / setActiveConsole
 *   toggleFlipButton / setLoadingVisible
 */

import { consoles } from '../model/consoles.js';

/* =============================================
   公共入口（index.html 主页使用）
   ============================================= */
export function bindUI(callbacks) {
  bindNavDropdown(callbacks.onConsoleSwitch);
  bindConsoleCards(callbacks.onConsoleSwitch);
  bindSceneButtons(callbacks);
}

/* =============================================
   场景控制按钮（展品页 viewer.js 单独调用）
   ============================================= */
export function bindSceneButtons({
  onWireframeToggle,
  onLightToggle,
  onBgmToggle,
  onFlip,
  onAutoRotateToggle,
  onColorChange,
  onColorReset,
  getFlipState,        // 从 viewer.js 读取当前 isFlipOpen，避免相机预设切换后按钮状态不同步
} = {}) {
  bindToggleBtn('btn-wireframe', onWireframeToggle);
  bindToggleBtn('btn-light',     onLightToggle);
  bindToggleBtn('btn-bgm',       onBgmToggle);
  bindToggleBtn('btn-rotate',    onAutoRotateToggle);

  const flipBtn = document.getElementById('btn-flip');
  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      const currentlyOpen = getFlipState?.() ?? true;
      onFlip?.(!currentlyOpen);
    });
  }

  // 颜色拾取器（原生 <input type="color">）
  const colorInput = document.getElementById('btn-color');
  if (colorInput) {
    colorInput.addEventListener('input', (e) => onColorChange?.(e.target.value));
  }

  // 颜色重置按钮（恢复模型原色）
  const colorResetBtn = document.getElementById('btn-color-reset');
  if (colorResetBtn) {
    colorResetBtn.addEventListener('click', () => onColorReset?.());
  }
}

/* ---- 内部：通用 toggle 按钮绑定 ---- */
function bindToggleBtn(id, callback) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(next));
    btn.classList.toggle('active', next);
    callback?.(next);
  });
}

/* ---- 导航栏 Dropdown 链接（index.html 主页用） ---- */
function bindNavDropdown(onSwitch) {
  document.querySelectorAll('.museum-dropdown [data-console]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const data = consoles.find((c) => c.id === el.dataset.console);
      if (data) onSwitch?.(data);
    });
  });
}

/* ---- 展品卡片按钮（index.html 主页用） ---- */
function bindConsoleCards(onSwitch) {
  // "加载展品"按钮
  document.querySelectorAll('.btn-load[data-console]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const data = consoles.find((c) => c.id === btn.dataset.console);
      if (data) onSwitch?.(data);
    });
  });
  // 点击整张卡片（冒泡中排除按钮自身）
  document.querySelectorAll('.museum-card[data-console]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-load')) return;
      const data = consoles.find((c) => c.id === card.dataset.console);
      if (data) onSwitch?.(data);
    });
  });
}

/* =============================================
   共享 UI 更新函数（index.html 和展品页均可用）
   ============================================= */

/** 动态生成相机预设按钮 */
export function updateCameraPresets(consoleData, onPresetClick) {
  const container = document.getElementById('camera-presets');
  if (!container) return;
  container.innerHTML = '';

  consoleData.cameraPresets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-camera-preset' + (index === 0 ? ' active' : '');
    btn.textContent = preset.name;
    btn.setAttribute('aria-label', `Switch to ${preset.name} view`);
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-camera-preset').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onPresetClick?.(preset);
    });
    container.appendChild(btn);
  });
}

/** 更新 Hero 展品信息浮层 */
export function updateConsoleInfo(consoleData) {
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('info-name', `${consoleData.manufacturer} ${consoleData.name}`);
  set('info-year', `Released ${consoleData.year}`);
  set('info-desc', consoleData.description);
}

/** 高亮当前活跃展品卡片和 dropdown 条目（index.html 主页用） */
export function setActiveConsole(consoleId) {
  document.querySelectorAll('.museum-card[data-console]').forEach((card) => {
    card.classList.toggle('active-card', card.dataset.console === consoleId);
  });
  document.querySelectorAll('.museum-dropdown [data-console]').forEach((item) => {
    item.classList.toggle('active-console', item.dataset.console === consoleId);
  });
}

/** 翻盖按钮显示/隐藏（仅 GBA SP 可见） */
export function toggleFlipButton(show) {
  const btn = document.getElementById('btn-flip');
  if (btn) btn.classList.toggle('d-none', !show);
}

/** 加载遮罩显示/隐藏 */
export function setLoadingVisible(visible, text = 'Loading exhibit…') {
  const overlay = document.getElementById('loading-overlay');
  const textEl  = document.getElementById('loading-text');
  if (!overlay) return;
  if (textEl) textEl.textContent = text;
  overlay.classList.toggle('hidden', !visible);
}
