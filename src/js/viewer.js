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
  setupFlipAction,
  playFlipAction,
} from './view/animations.js';
import {
  bindSceneButtons,
  updateCameraPresets,
  updateConsoleInfo,
  toggleFlipButton,
  setLoadingVisible,
} from './controller/ui.js';
import { setWireframe, bindModelInteraction, tintModel, resetModelColors } from './controller/interaction.js';
// BGM 由顶部全局播放器（bgmInit.js + bgmPlayer.js）统一管理，不再使用 audio.js

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
    mixer:        null,        // AnimationMixer（真实 GLB 才会创建）
    flipAction:   null,        // 翻盖 AnimationAction
    isWireframe:  false,
    isMainLightOn: true,
    isBgmPlaying: false,
    isFlipOpen:   true,        // 模型默认加载为"打开"姿态（动画第 0 帧）
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
    /* BGM 由顶部全局播放器接管，本页不再绑定 onBgmToggle */
    onFlip: (open) => {
      state.isFlipOpen = open;
      // 优先使用 GLTF 内嵌动画（真实 GLB）
      if (state.flipAction) {
        playFlipAction(state.flipAction, open);
        return;
      }
      // 占位方块兜底：旋转名为 'lid' 的 mesh
      const lid = state.currentModel?.getObjectByName('lid');
      if (lid) animateFlip(lid, open);
    },
    onAutoRotateToggle: (on) => {
      controls.autoRotate = on;
      controls.autoRotateSpeed = 2.0;
    },
    onColorChange: (hex) => tintModel(state.currentModel, hex),
    onColorReset:  ()    => resetModelColors(state.currentModel),
    getFlipState:  ()    => state.isFlipOpen,
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
  setLoadingVisible(true, `Loading ${consoleData.name}…`);

  state.currentModel = await loadConsoleModel(consoleData, (progress) => {
    setLoadingVisible(true, `Loading ${Math.round(progress * 100)}%…`);
  });
  scene.add(state.currentModel);

  /* ---- 配置 GLTF 内嵌动画（如有） ---- */
  const clips = state.currentModel.userData.animations ?? [];
  if (clips.length > 0) {
    state.mixer = new THREE.AnimationMixer(state.currentModel);
    // 优先匹配名字含 flip/lid/open/close 的 clip，否则用第一个
    const flipClip =
      clips.find((c) => /flip|lid|open|close/i.test(c.name)) ?? clips[0];
    state.flipAction = setupFlipAction(state.mixer, flipClip);
    console.info('[viewer] 已绑定翻盖动画 clip:', flipClip.name);
  }

  /* ---- 更新 UI ---- */
  updateConsoleInfo(consoleData);
  updateCameraPresets(consoleData, (preset) => {
    animateCameraToPreset(camera, controls, preset);
    // 相机预设可附带 flipState='open'|'closed'，驱动翻盖动画到对应姿态
    if (preset.flipState && state.flipAction) {
      const wantOpen = preset.flipState === 'open';
      if (wantOpen !== state.isFlipOpen) {
        state.isFlipOpen = wantOpen;
        playFlipAction(state.flipAction, wantOpen);
      }
    }
  });
  toggleFlipButton(!!consoleData.hasFlipAnimation);
  animateCameraToPreset(camera, controls, consoleData.cameraPresets[0]);

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

    /* 推进 AnimationMixer（翻盖动画） */
    state.mixer?.update(delta);

    controls.update();
    composer.render(delta);
  }
  animate();
}

initViewer();
