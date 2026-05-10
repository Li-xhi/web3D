/**
 * MVC — Controller 层
 * 负责：BGM 播放控制（每台掌机对应不同 BGM）
 *       遵循浏览器自动播放策略：需要用户手势触发
 */

let currentAudio = null;

/**
 * 切换到新掌机时更新 BGM 音源（不自动播放）
 * @param {string} bgmPath
 */
export function loadBgm(bgmPath) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
  }
  currentAudio = new Audio(bgmPath);
  currentAudio.loop = true;
  currentAudio.volume = 0.5;
}

/**
 * 播放或暂停当前 BGM
 * @param {boolean} play
 */
export function setBgmPlaying(play) {
  if (!currentAudio) return;
  if (play) {
    currentAudio.play().catch(() => {
      // 浏览器阻止自动播放时静默失败，用户点击后再次尝试
      console.warn('[audio] 自动播放被浏览器阻止，请点击 BGM 按钮');
    });
  } else {
    currentAudio.pause();
  }
}

/** 停止并释放当前 BGM */
export function stopBgm() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.src = '';
  currentAudio = null;
}
