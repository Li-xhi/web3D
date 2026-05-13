/**
 * MVC — View 层
 * 负责：主页卡片中的轻量级 3D 模型预览
 *
 * 与展品页 viewer.js 的区别：
 *   - 无 OrbitControls（避免和卡片点击冲突）
 *   - 无后处理 / 无阴影（性能优先，三个 canvas 同屏）
 *   - 自动慢转，模型自带材质
 *   - 加载失败时不显示，回退到 CSS 渐变背景
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

/**
 * 在指定 canvas 中初始化一个小型预览场景并加载模型
 * @param {HTMLCanvasElement} canvas
 * @param {object} consoleData - 来自 consoles.js
 */
export function initPreview(canvas, consoleData) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // 透明背景，让卡片渐变作为兜底
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth || 300, canvas.clientHeight || 160, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    (canvas.clientWidth || 300) / (canvas.clientHeight || 160),
    0.1,
    100
  );
  camera.position.set(0, 0.4, 3.2);

  /* ---- 灯光（极简：环境光 + 一盏方向光） ---- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.6);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  let model = null;

  gltfLoader.load(
    consoleData.modelPath,
    (gltf) => {
      model = gltf.scene;
      centerAndScale(model, consoleData.previewScale ?? 1.6);
      scene.add(model);
      // 不绑定 AnimationMixer：模型停在第 0 帧（打开姿态），跟其他两台一样只做慢转
    },
    undefined,
    () => {
      console.warn(`[preview] 未找到 ${consoleData.modelPath}`);
    }
  );

  /* ---- Resize 监听（卡片可能在小屏下换列） ---- */
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas);

  /* ---- 渲染循环（慢转） ---- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (model) model.rotation.y += delta * 0.4;
    renderer.render(scene, camera);
  }
  animate();
}

/** 居中并缩放到指定最大尺寸 */
function centerAndScale(model, targetSize = 1.6) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxDim;
  model.position.sub(center.multiplyScalar(scale));
  model.scale.setScalar(scale);
}
