/**
 * MVC — Controller 层（展品页入口）
 * 负责：单台掌机页面（gameboy.html / gba_sp.html / psp.html）的 3D 查看器
 *
 * 通过 <body data-console-id="gameboy"> 读取要展示的掌机 ID，
 * 只加载该掌机的模型，不做页间切换（页间切换由导航栏链接完成）。
 */

import * as THREE from 'three';
import { findConsoleById } from './model/consoles.js';
import { initScene, handleResize } from './view/scene.js';
import { loadConsoleModel } from './view/loader.js';
import { initPostProcess, resizeComposer } from './view/postprocess.js';
import {
  animateCameraToPreset,
  animateFlip,
  animateButtonPress,
  animateScreenOn,
} from './view/animations.js';
import {
  bindSceneButtons,
  updateCameraPresets,
  updateConsoleInfo,
  toggleFlipButton,
  setLoadingVisible,
} from './controller/ui.js';
import { setWireframe, bindModelInteraction } from './controller/interaction.js';
import { loadBgm, setBgmPlaying } from './controller/audio.js';

/* =============================================
   页面初始化
   ============================================= */
async function initViewer() {
  /* 从 <body data-console-id="..."> 读取掌机 ID */
  const consoleId   = document.body.dataset.consoleId;
  const consoleData = findConsoleById(consoleId);

  if (!consoleData) {
    console.error('[viewer] 未知的 data-console-id:', consoleId);
    return;
  }

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  /* ---- 共享状态 ---- */
  const state = {
    currentModel: null,
    isWireframe:  false,
    isMainLightOn: true,
    isBgmPlaying: false,
    isFlipOpen:   false,
    isScreenOn:   false,
    clock:        new THREE.Clock(),
  };

  /* ---- 初始化场景 ---- */
  const { renderer, scene, camera, controls, lights } = initScene(canvas);
  const { composer } = initPostProcess(renderer, scene, camera);

  /* ---- 绑定场景控制按钮 ---- */
  bindSceneButtons({
    onWireframeToggle: (on) => {
      state.isWireframe = on;
      setWireframe(state.currentModel, on);
    },
    onLightToggle: (on) => {
      state.isMainLightOn = on;
      lights.mainLight.visible = on;
    },
    onBgmToggle: (on) => {
      state.isBgmPlaying = on;
      setBgmPlaying(on);
    },
    onFlip: (open) => {
      state.isFlipOpen = open;
      const lid = state.currentModel?.getObjectByName('lid');
      if (lid) animateFlip(lid, open);
    },
  });

  /* ---- 绑定模型点击（屏幕开机 / 按键按下） ---- */
  bindModelInteraction(canvas, camera, state, {
    onScreenClick: (mesh) => {
      if (!state.isScreenOn) {
        state.isScreenOn = true;
        animateScreenOn(mesh.material);
      }
    },
    onButtonClick: (mesh) => animateButtonPress(mesh),
  });

  /* ---- 加载模型 ---- */
  setLoadingVisible(true, `正在加载 ${consoleData.name}…`);

  state.currentModel = await loadConsoleModel(consoleData, (progress) => {
    setLoadingVisible(true, `加载中 ${Math.round(progress * 100)}%…`);
  });
  scene.add(state.currentModel);

  /* ---- 更新 UI ---- */
  updateConsoleInfo(consoleData);
  updateCameraPresets(consoleData, (preset) =>
    animateCameraToPreset(camera, controls, preset)
  );
  toggleFlipButton(!!consoleData.hasFlipAnimation);
  animateCameraToPreset(camera, controls, consoleData.cameraPresets[0]);

  /* ---- 加载 BGM（不自动播放，等用户点击） ---- */
  loadBgm(consoleData.bgm);

  setLoadingVisible(false);

  /* ---- Resize 监听 ---- */
  const ro = new ResizeObserver(() => {
    handleResize(renderer, camera, canvas);
    resizeComposer(composer, canvas.clientWidth, canvas.clientHeight);
  });
  ro.observe(canvas.parentElement);

  /* ---- 渲染循环 ---- */
  function animate() {
    requestAnimationFrame(animate);
    const delta = state.clock.getDelta();

    /* 占位方块旋转；真实 GLB 加载后静止 */
    if (state.currentModel && !state.currentModel.userData.isRealModel) {
      state.currentModel.rotation.y += delta * 0.5;
    }

    controls.update();
    composer.render(delta);
  }
  animate();
}

initViewer();
