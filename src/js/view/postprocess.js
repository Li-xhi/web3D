/**
 * MVC — View 层
 * 负责：EffectComposer 后期处理管线（UnrealBloomPass 发光）
 */

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as THREE from 'three';

/**
 * 初始化后期处理管线
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {{ composer: EffectComposer, bloomPass: UnrealBloomPass }}
 */
export function initPostProcess(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // 基础渲染 Pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Bloom 发光 Pass（让屏幕和 LED 发光）
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,    // 强度
    0.4,    // 半径
    0.85    // 阈值：只有亮度超过此值的像素才会发光
  );
  composer.addPass(bloomPass);

  // 输出 Pass（颜色空间转换）
  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { composer, bloomPass };
}

/** 更新 composer 尺寸（响应窗口 resize） */
export function resizeComposer(composer, width, height) {
  composer.setSize(width, height);
}
