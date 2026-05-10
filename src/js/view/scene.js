/**
 * MVC — View 层
 * 负责：Three.js 场景初始化、相机、渲染器、灯光管理
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** 初始化并返回核心场景对象 */
export function initScene(canvas) {
  /* ---- 渲染器 ---- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* ---- 场景 ---- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0f);
  // 轻微雾气，增强博物馆纵深感
  scene.fog = new THREE.FogExp2(0x0d0d0f, 0.08);

  /* ---- 相机 ---- */
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.01,
    100
  );
  camera.position.set(0, 0.5, 4);

  /* ---- OrbitControls ---- */
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.maxPolarAngle = Math.PI * 0.85;
  // 允许键盘方向键旋转（可访问性）
  controls.listenToKeyEvents(window);
  controls.keys = {
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    BOTTOM: 'ArrowDown',
  };

  /* ---- 灯光 ---- */
  // 环境光：提供整体基础照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // 主光：从右上方照射，产生明暗关系
  const mainLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
  mainLight.position.set(3, 5, 3);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(1024, 1024);
  mainLight.shadow.camera.near = 0.1;
  mainLight.shadow.camera.far = 20;
  scene.add(mainLight);

  // 补光：从左侧柔和填充，减少死阴影
  const fillLight = new THREE.DirectionalLight(0xc0d8ff, 0.8);
  fillLight.position.set(-3, 1, -2);
  scene.add(fillLight);

  // 展台顶光（模拟博物馆聚光灯）
  const spotLight = new THREE.SpotLight(0xfff8e7, 3, 12, Math.PI / 6, 0.5, 2);
  spotLight.position.set(0, 6, 2);
  spotLight.target.position.set(0, 0, 0);
  scene.add(spotLight);
  scene.add(spotLight.target);

  /* ---- 展台地面（反射模型阴影） ---- */
  const platformGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.05, 64);
  const platformMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a22,
    roughness: 0.3,
    metalness: 0.6,
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = -1.2;
  platform.receiveShadow = true;
  scene.add(platform);

  return { renderer, scene, camera, controls, lights: { ambientLight, mainLight, fillLight, spotLight } };
}

/** 处理窗口 resize，保持相机宽高比和渲染器尺寸 */
export function handleResize(renderer, camera, canvas) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
