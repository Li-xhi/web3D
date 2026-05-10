/**
 * MVC — View 层
 * 负责：GLTF 模型动态加载 + 占位方块生成
 *       当真实 .glb 不存在时，自动降级为颜色方块
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

/**
 * 加载指定掌机的 3D 模型（GLB）
 * 如果加载失败则返回颜色占位方块
 * @param {object} consoleData - 来自 consoles.js 的掌机元数据
 * @param {function} onProgress - 加载进度回调 (0~1)
 * @returns {Promise<THREE.Group>}
 */
export function loadConsoleModel(consoleData, onProgress) {
  return new Promise((resolve) => {
    gltfLoader.load(
      consoleData.modelPath,
      (gltf) => {
        const model = gltf.scene;
        // 居中并缩放到合适大小
        centerAndScale(model);
        model.userData.consoleId = consoleData.id;
        model.userData.isRealModel = true;
        resolve(model);
      },
      (event) => {
        if (event.total > 0 && onProgress) {
          onProgress(event.loaded / event.total);
        }
      },
      () => {
        // GLB 不存在时降级为占位方块
        console.warn(`[loader] 未找到 ${consoleData.modelPath}，使用占位方块`);
        const placeholder = createPlaceholder(consoleData);
        resolve(placeholder);
      }
    );
  });
}

/**
 * 创建颜色占位方块（三台掌机各自不同颜色）
 * 包含简单动画骨骼以便后续测试翻盖动画
 */
function createPlaceholder(consoleData) {
  const group = new THREE.Group();

  // 主机身
  const bodyGeo = new THREE.BoxGeometry(1.2, 1.8, 0.3);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: consoleData.placeholderColor,
    roughness: 0.6,
    metalness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.name = 'body';
  group.add(body);

  // 屏幕区域（用于后期替换为 VideoTexture / CRT shader）
  const screenGeo = new THREE.PlaneGeometry(0.8, 0.7);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.1,
    metalness: 0.0,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0.35, 0.16);
  screen.name = 'screen';
  group.add(screen);

  // 翻盖（仅 GBA SP 使用，其他机型设为不可见）
  if (consoleData.hasFlipAnimation) {
    const lidGeo = new THREE.BoxGeometry(1.2, 1.0, 0.2);
    const lidMat = new THREE.MeshStandardMaterial({
      color: consoleData.placeholderColor,
      roughness: 0.4,
      metalness: 0.5,
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 1.4, 0);
    lid.name = 'lid';
    group.add(lid);
  }

  group.userData.consoleId = consoleData.id;
  group.userData.isRealModel = false;
  group.userData.screenMesh = screen;

  return group;
}

/** 将模型几何居中并缩放至 [-1, 1] 范围 */
function centerAndScale(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.0 / maxDim;

  model.position.sub(center.multiplyScalar(scale));
  model.scale.setScalar(scale);
}

/**
 * 在场景中切换展示的掌机：移除旧模型，加载新模型
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D|null} currentModel - 当前场景中的模型（null 表示首次加载）
 * @param {object} consoleData
 * @param {function} onProgress
 * @returns {Promise<THREE.Group>}
 */
export async function switchModel(scene, currentModel, consoleData, onProgress) {
  if (currentModel) {
    scene.remove(currentModel);
    disposeModel(currentModel);
  }
  const newModel = await loadConsoleModel(consoleData, onProgress);
  scene.add(newModel);
  return newModel;
}

/** 递归释放模型的 geometry 和 material，避免显存泄漏 */
function disposeModel(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        Object.values(m).forEach((val) => {
          if (val && val.isTexture) val.dispose();
        });
        m.dispose();
      });
    }
  });
}
