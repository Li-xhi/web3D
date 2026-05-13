/**
 * MVC — Controller 层
 * 负责：模型点击检测（Raycasting）、wireframe 切换、屏幕点击"开机"
 */

import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * 绑定画布点击事件，检测是否点击到模型
 * @param {HTMLCanvasElement} canvas
 * @param {THREE.Camera} camera
 * @param {object} state - 共享状态对象 { currentModel }
 * @param {object} callbacks - { onScreenClick, onButtonClick }
 */
export function bindModelInteraction(canvas, camera, state, callbacks) {
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (!state.currentModel) return;
    const intersects = raycaster.intersectObject(state.currentModel, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      if (hit.name === 'screen') {
        callbacks.onScreenClick?.(hit);
      } else if (hit.name === 'buttonA' || hit.name === 'buttonB') {
        callbacks.onButtonClick?.(hit);
      }
    }
  });
}

/**
 * 切换场景内所有模型的 wireframe 模式
 * @param {THREE.Object3D} model
 * @param {boolean} enabled
 */
export function setWireframe(model, enabled) {
  if (!model) return;
  model.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => { m.wireframe = enabled; });
    }
  });
}

/* ---- 颜色变换：在首次调用时缓存原始颜色，之后可恢复 ---- */
function ensureOriginalColors(model) {
  if (model.userData.colorsCached) return;
  model.userData.colorsCached = true;
  model.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m.color) m.userData.originalColor = m.color.clone();
      });
    }
  });
}

/**
 * 给模型整体染色（乘性 tint，保留贴图细节）
 * @param {THREE.Object3D} model
 * @param {string} colorHex - 例如 "#ff8800"
 */
export function tintModel(model, colorHex) {
  if (!model) return;
  ensureOriginalColors(model);
  const target = new THREE.Color(colorHex);
  model.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => { if (m.color) m.color.copy(target); });
    }
  });
}

/**
 * 恢复模型原始颜色
 * @param {THREE.Object3D} model
 */
export function resetModelColors(model) {
  if (!model || !model.userData.colorsCached) return;
  model.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (m.color && m.userData.originalColor) {
          m.color.copy(m.userData.originalColor);
        }
      });
    }
  });
}
