/**
 * MVC — View 层
 * 负责：GSAP 动画封装（相机过渡、翻盖、按键按下、模型 fade）
 */

import gsap from 'gsap';
import * as THREE from 'three';

/**
 * 相机平滑移动到预设位置
 * @param {THREE.Camera} camera
 * @param {THREE.OrbitControls} controls
 * @param {{ position: number[], target: number[] }} preset
 */
export function animateCameraToPreset(camera, controls, preset) {
  const [px, py, pz] = preset.position;
  const [tx, ty, tz] = preset.target;

  gsap.to(camera.position, {
    x: px, y: py, z: pz,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: () => {
      controls.target.lerp(new THREE.Vector3(tx, ty, tz), 0.1);
      controls.update();
    },
  });
}

/**
 * GBA SP 翻盖动画（铰链从 0° 旋转到 135°，或返回 0°）
 * @param {THREE.Object3D} lidMesh - 翻盖网格
 * @param {boolean} open - true=打开，false=合上
 */
export function animateFlip(lidMesh, open) {
  const targetRotation = open ? -Math.PI * 0.75 : 0;
  gsap.to(lidMesh.rotation, {
    x: targetRotation,
    duration: 0.9,
    ease: 'back.inOut(1.5)',
  });
}

/**
 * 模型切换时的 fade out / fade in（GSAP 操控 opacity）
 * @param {THREE.Object3D} model
 * @param {'in'|'out'} direction
 * @param {function} [onComplete]
 */
export function fadeModel(model, direction, onComplete) {
  const from = direction === 'in' ? 0 : 1;
  const to = direction === 'in' ? 1 : 0;

  // 先将所有材质设为透明
  model.traverse((child) => {
    if (child.isMesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        m.transparent = true;
        m.opacity = from;
      });
    }
  });

  gsap.to({ opacity: from }, {
    opacity: to,
    duration: 0.4,
    ease: 'power2.inOut',
    onUpdate: function () {
      const val = this.targets()[0].opacity;
      model.traverse((child) => {
        if (child.isMesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => { m.opacity = val; });
        }
      });
    },
    onComplete: () => {
      if (direction === 'in') {
        // 动画结束后恢复非透明（改善性能）
        model.traverse((child) => {
          if (child.isMesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => { m.transparent = false; m.opacity = 1; });
          }
        });
      }
      onComplete?.();
    },
  });
}

/**
 * 按键按下动画（沿 -Z 方向微微下沉）
 * @param {THREE.Object3D} buttonMesh
 */
export function animateButtonPress(buttonMesh) {
  gsap.timeline()
    .to(buttonMesh.position, { z: buttonMesh.position.z - 0.04, duration: 0.08, ease: 'power2.in' })
    .to(buttonMesh.position, { z: buttonMesh.position.z, duration: 0.15, ease: 'power2.out' });
}

/**
 * 屏幕开机动画（发光从 0 增强到目标值）
 * @param {THREE.Material} screenMaterial
 * @param {number} targetIntensity
 */
export function animateScreenOn(screenMaterial, targetIntensity = 1.5) {
  gsap.to(screenMaterial, {
    emissiveIntensity: targetIntensity,
    duration: 0.6,
    ease: 'power2.out',
  });
}
