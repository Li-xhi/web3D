/**
 * MVC — Controller 层（主入口）
 * 负责：初始化场景、协调 Model / View / Controller 各层、驱动渲染循环
 */

import * as THREE from 'three';
import { consoles, findConsoleById } from './model/consoles.js';
import { initScene, handleResize } from './view/scene.js';
import { switchModel } from './view/loader.js';
import { initPostProcess, resizeComposer } from './view/postprocess.js';
import { animateCameraToPreset, animateFlip, fadeModel, animateButtonPress, animateScreenOn } from './view/animations.js';
import { bindUI, updateCameraPresets, updateConsoleInfo, toggleFlipButton, setLoadingVisible } from './controller/ui.js';
import { setWireframe, bindModelInteraction } from './controller/interaction.js';
import { loadBgm, setBgmPlaying } from './controller/audio.js';

// =============================================
// 共享状态（整个应用的可变状态集中在此）
// =============================================
const state = {
  currentModel: null,    // 当前场景中的 3D 模型
  currentConsole: null,  // 当前展示的掌机数据
  isWireframe: false,
  isMainLightOn: true,
  isBgmPlaying: false,
  isFlipOpen: false,
  isScreenOn: false,
  clock: new THREE.Clock(),
};

// =============================================
// 主入口
// =============================================
async function main() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  /* --- 初始化场景 --- */
  const { renderer, scene, camera, controls, lights } = initScene(canvas);

  /* --- 初始化后期处理 --- */
  const { composer, bloomPass } = initPostProcess(renderer, scene, camera);

  /* --- 绑定 UI 事件 --- */
  bindUI({
    onConsoleSwitch: (consoleData) => handleConsoleSwitch(consoleData),
    onWireframeToggle: (enabled) => {
      state.isWireframe = enabled;
      setWireframe(state.currentModel, enabled);
    },
    onLightToggle: (enabled) => {
      state.isMainLightOn = enabled;
      lights.mainLight.visible = enabled;
    },
    onBgmToggle: (enabled) => {
      state.isBgmPlaying = enabled;
      setBgmPlaying(enabled);
    },
    onFlip: (open) => {
      state.isFlipOpen = open;
      if (state.currentModel) {
        const lid = state.currentModel.getObjectByName('lid');
        if (lid) animateFlip(lid, open);
      }
    },
  });

  /* --- 绑定模型点击 --- */
  bindModelInteraction(canvas, camera, state, {
    onScreenClick: (screenMesh) => {
      if (!state.isScreenOn) {
        state.isScreenOn = true;
        animateScreenOn(screenMesh.material);
      }
    },
    onButtonClick: (buttonMesh) => {
      animateButtonPress(buttonMesh);
    },
  });

  /* --- 加载第一台掌机 --- */
  await handleConsoleSwitch(consoles[0]);

  /* --- 窗口 resize --- */
  const resizeObserver = new ResizeObserver(() => {
    handleResize(renderer, camera, canvas);
    resizeComposer(composer, canvas.clientWidth, canvas.clientHeight);
  });
  resizeObserver.observe(canvas.parentElement);

  /* --- 渲染循环 --- */
  function animate() {
    requestAnimationFrame(animate);
    const delta = state.clock.getDelta();

    // 占位方块：持续旋转动画
    if (state.currentModel && !state.currentModel.userData.isRealModel) {
      state.currentModel.rotation.y += delta * 0.5;
    }

    controls.update();
    composer.render(delta);
  }
  animate();

  // =============================================
  // 掌机切换流程
  // =============================================
  async function handleConsoleSwitch(consoleData) {
    state.currentConsole = consoleData;
    state.isFlipOpen = false;
    state.isScreenOn = false;

    setLoadingVisible(true, `正在加载 ${consoleData.name}…`);

    // Fade out 旧模型
    if (state.currentModel) {
      await new Promise((resolve) => fadeModel(state.currentModel, 'out', resolve));
    }

    // 加载新模型
    state.currentModel = await switchModel(scene, state.currentModel, consoleData, (progress) => {
      setLoadingVisible(true, `加载中 ${Math.round(progress * 100)}%…`);
    });

    // 恢复 wireframe 状态
    setWireframe(state.currentModel, state.isWireframe);

    // Fade in 新模型
    fadeModel(state.currentModel, 'in');

    // 更新 UI
    updateConsoleInfo(consoleData);
    updateCameraPresets(consoleData, (preset) => {
      animateCameraToPreset(camera, controls, preset);
    });
    toggleFlipButton(!!consoleData.hasFlipAnimation);

    // 加载 BGM（不自动播放）
    loadBgm(consoleData.bgm);
    state.isBgmPlaying = false;
    document.getElementById('btn-bgm')?.setAttribute('aria-pressed', 'false');

    // 跳到第一个相机预设
    animateCameraToPreset(camera, controls, consoleData.cameraPresets[0]);

    setLoadingVisible(false);
  }
}

main();
