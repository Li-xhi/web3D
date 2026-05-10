/**
 * MVC — Controller 层
 * 负责：UI 事件绑定（导航栏 dropdown、展品卡片、相机预设、场景控制按钮）
 *       不直接操作 Three.js 对象，通过回调委托给 main.js
 *
 * 新结构对应 index.html：
 *   - 导航栏 dropdown 的 [data-console] 链接
 *   - 展品卡片的 .btn-load 按钮
 *   - 相机预设 #camera-presets 容器（动态生成）
 *   - Hero 控制浮层：#btn-wireframe / #btn-light / #btn-bgm / #btn-flip
 */

import { consoles } from '../model/consoles.js';

/**
 * 绑定所有 UI 事件
 * @param {object} callbacks
 */
export function bindUI(callbacks) {
  bindNavDropdown(callbacks.onConsoleSwitch);
  bindConsoleCards(callbacks.onConsoleSwitch);
  bindSceneButtons(callbacks);
}

/* ---- 导航栏 Dropdown 链接 ---- */
function bindNavDropdown(onSwitch) {
  document.querySelectorAll('[data-console]').forEach((el) => {
    // 只绑定导航里的 <a> 标签（排除卡片按钮，卡片单独处理）
    if (el.tagName !== 'A') return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.dataset.console;
      const data = consoles.find((c) => c.id === id);
      if (data) onSwitch?.(data);
    });
  });
}

/* ---- 展品卡片按钮 ---- */
function bindConsoleCards(onSwitch) {
  document.querySelectorAll('.btn-load').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.console;
      const data = consoles.find((c) => c.id === id);
      if (data) onSwitch?.(data);
    });
  });

  // 点击整张卡片也触发（提升交互面积）
  document.querySelectorAll('.museum-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // 防止重复触发（卡片内按钮会冒泡）
      if (e.target.closest('.btn-load')) return;
      const id = card.dataset.console;
      const data = consoles.find((c) => c.id === id);
      if (data) onSwitch?.(data);
    });
  });
}

/* ---- Hero 浮层场景控制按钮 ---- */
function bindSceneButtons({ onWireframeToggle, onLightToggle, onBgmToggle, onFlip }) {
  bindToggleBtn('btn-wireframe', onWireframeToggle);
  bindToggleBtn('btn-light', onLightToggle);
  bindToggleBtn('btn-bgm', onBgmToggle);

  const flipBtn = document.getElementById('btn-flip');
  if (flipBtn) {
    let isOpen = false;
    flipBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      onFlip?.(isOpen);
    });
  }
}

function bindToggleBtn(id, callback) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOn = btn.getAttribute('aria-pressed') === 'true';
    const next = !isOn;
    btn.setAttribute('aria-pressed', String(next));
    btn.classList.toggle('active', next);
    callback?.(next);
  });
}

/**
 * 动态生成相机预设按钮（#camera-presets 容器）
 * @param {object} consoleData
 * @param {function} onPresetClick
 */
export function updateCameraPresets(consoleData, onPresetClick) {
  const container = document.getElementById('camera-presets');
  if (!container) return;
  container.innerHTML = '';

  consoleData.cameraPresets.forEach((preset, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-camera-preset' + (index === 0 ? ' active' : '');
    btn.textContent = preset.name;
    btn.setAttribute('aria-label', `切换到${preset.name}视角`);
    btn.addEventListener('click', () => {
      container.querySelectorAll('.btn-camera-preset').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onPresetClick?.(preset);
    });
    container.appendChild(btn);
  });
}

/**
 * 更新 Hero 右下角展品信息浮层
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
 * 高亮活跃的展品卡片，并同步导航 dropdown 状态
 * @param {string} consoleId
 */
export function setActiveConsole(consoleId) {
  // 卡片
  document.querySelectorAll('.museum-card').forEach((card) => {
    card.classList.toggle('active-card', card.dataset.console === consoleId);
  });

  // 导航 dropdown 条目
  document.querySelectorAll('.museum-dropdown .dropdown-item').forEach((item) => {
    item.classList.toggle('active-console', item.dataset.console === consoleId);
  });
}

/**
 * 显示/隐藏翻盖按钮（仅 GBA SP 可见）
 * @param {boolean} show
 */
export function toggleFlipButton(show) {
  const btn = document.getElementById('btn-flip');
  if (!btn) return;
  btn.classList.toggle('d-none', !show);
}

/**
 * 显示/隐藏加载遮罩
 * @param {boolean} visible
 * @param {string} [text]
 */
export function setLoadingVisible(visible, text = '正在加载展品…') {
  const overlay = document.getElementById('loading-overlay');
  const textEl  = document.getElementById('loading-text');
  if (!overlay) return;
  if (textEl) textEl.textContent = text;
  overlay.classList.toggle('hidden', !visible);
}
