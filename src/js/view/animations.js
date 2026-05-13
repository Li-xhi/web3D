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
 * GBA SP 翻盖动画（占位方块用：直接旋转 lid mesh）
 * 真实 GLB 模型请使用 setupFlipAction + playFlipAction（基于 AnimationMixer）
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
 * 配置 GLTF 内嵌动画的 Action
 * - LoopOnce + clampWhenFinished：动画停在末帧，不会闪回起点
 * - 初始暂停于第 0 帧（= 模型的初始姿态）
 * @param {THREE.AnimationMixer} mixer
 * @param {THREE.AnimationClip} clip
 * @returns {THREE.AnimationAction}
 */
export function setupFlipAction(mixer, clip) {
  const action = mixer.clipAction(clip);
  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;
  action.play();
  action.paused = true; // 停在第 0 帧（打开姿态）
  return action;
}

/**
 * 切换翻盖方向（正放=关，倒放=开）
 * 用户录的是单向"关闭"动画，倒放即打开
 * @param {THREE.AnimationAction} action
 * @param {boolean} open - true=打开（倒放），false=关闭（正放）
 */
export function playFlipAction(action, open) {
  const dur = action.getClip().duration;

  // 如果当前停在边界，先把时间拨到对侧，否则播放方向不对
  if (open && action.time <= 0)        action.time = dur;
  if (!open && action.time >= dur - 0.001) action.time = 0;

  action.timeScale = open ? -1 : 1;
  action.paused = false;
  if (!action.isRunning()) action.play();
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
