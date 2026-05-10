/**
 * MVC — Controller 层（主入口）
 * 负责：初始化场景，协调 Model / View / Controller 各层，驱动渲染循环
 *
 * 新页面结构（Lab1 风格）：
 *   navbar → #hero（canvas） → camera-bar → consoles-section → footer
 *   展品切换由卡片按钮 / 导航 dropdown 触发，无侧边栏
 */

import * as THREE from 'three';
import { consoles, findConsoleById } from './model/consoles.js';
import { initScene, handleResize } from './view/scene.js';
import { switchModel } from './view/loader.js';
import { initPostProcess, resizeComposer } from './view/postprocess.js';
import {
  animateCameraToPreset,
  animateFlip,
  fadeModel,
  animateButtonPress,
  animateScreenOn,
} from './view/animations.js';
import {
  bindUI,
  updateCameraPresets,
  updateConsoleInfo,
  setActiveConsole,
  toggleFlipButton,
  setLoadingVisible,
} from './controller/ui.js';
import { setWireframe, bindModelInteraction } from './controller/interaction.js';
import { loadBgm, setBgmPlaying } from './controller/audio.js';

/* =============================================
   共享状态（整个应用的可变状态集中在此）
   ============================================= */
const state = {
  currentModel:   null,   // 场景中当前的 3D 模型
  currentConsole: null,   // 当前展示的掌机元数据
  isWireframe:    false,
  isMainLightOn:  true,
  isBgmPlaying:   false,
  isFlipOpen:     false,
  isScreenOn:     false,
  clock:          new THREE.Clock(),
};

/* =============================================
   主入口
   ============================================= */
async function main() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  /* 初始化场景 */
  const { renderer, scene, camera, controls, lights } = initScene(canvas);

  /* 初始化后期处理 */
  const { composer, bloomPass } = initPostProcess(renderer, scene, camera);

  /* 绑定 UI */
  bindUI({
    onConsoleSwitch:   (data) => handleConsoleSwitch(data),
    onWireframeToggle: (on)   => { state.isWireframe = on; setWireframe(state.currentModel, on); },
    onLightToggle:     (on)   => { state.isMainLightOn = on; lights.mainLight.visible = on; },
    onBgmToggle:       (on)   => { state.isBgmPlaying = on; setBgmPlaying(on); },
    onFlip: (open) => {
      state.isFlipOpen = open;
      if (state.currentModel) {
        const lid = state.currentModel.getObjectByName('lid');
        if (lid) animateFlip(lid, open);
      }
    },
  });

  /* 绑定模型点击（屏幕开机、按键按下） */
  bindModelInteraction(canvas, camera, state, {
    onScreenClick: (mesh) => {
      if (!state.isScreenOn) {
        state.isScreenOn = true;
        animateScreenOn(mesh.material);
      }
    },
    onButtonClick: (mesh) => animateButtonPress(mesh),
  });

  /* 加载首台展品（Game Boy） */
  await handleConsoleSwitch(consoles[0]);

  /* 窗口 resize：用 ResizeObserver 监听 canvas 父容器 */
  const resizeObserver = new ResizeObserver(() => {
    handleResize(renderer, camera, canvas);
    resizeComposer(composer, canvas.clientWidth, canvas.clientHeight);
  });
  resizeObserver.observe(canvas.parentElement);

  /* 渲染循环 */
  function animate() {
    requestAnimationFrame(animate);
    const delta = state.clock.getDelta();

    /* 占位方块：持续旋转，真实 GLB 加载后停止 */
    if (state.currentModel && !state.currentModel.userData.isRealModel) {
      state.currentModel.rotation.y += delta * 0.5;
    }

    controls.update();
    composer.render(delta);
  }
  animate();

  /* =============================================
     掌机切换流程
     ============================================= */
  async function handleConsoleSwitch(consoleData) {
    if (state.currentConsole?.id === consoleData.id) return; // 防止重复加载

    state.currentConsole = consoleData;
    state.isFlipOpen  = false;
    state.isScreenOn  = false;

    setLoadingVisible(true, `正在加载 ${consoleData.name}…`);

    /* Fade out 旧模型 */
    if (state.currentModel) {
      await new Promise((resolve) => fadeModel(state.currentModel, 'out', resolve));
    }

    /* 加载新模型 */
    state.currentModel = await switchModel(scene, state.currentModel, consoleData, (progress) => {
      setLoadingVisible(true, `加载中 ${Math.round(progress * 100)}%…`);
    });

    /* 恢复 wireframe 状态 */
    setWireframe(state.currentModel, state.isWireframe);

    /* Fade in */
    fadeModel(state.currentModel, 'in');

    /* 更新 UI */
    updateConsoleInfo(consoleData);
    updateCameraPresets(consoleData, (preset) => animateCameraToPreset(camera, controls, preset));
    setActiveConsole(consoleData.id);
    toggleFlipButton(!!consoleData.hasFlipAnimation);

    /* 跳到第一个相机预设 */
    animateCameraToPreset(camera, controls, consoleData.cameraPresets[0]);

    /* BGM：换源但不自动播放 */
    loadBgm(consoleData.bgm);
    state.isBgmPlaying = false;
    const bgmBtn = document.getElementById('btn-bgm');
    if (bgmBtn) {
      bgmBtn.setAttribute('aria-pressed', 'false');
      bgmBtn.classList.remove('active');
    }

    setLoadingVisible(false);
  }
}

main();
