/**
 * MVC — Controller 层（全站 BGM 入口）
 * 在每个页面绑定顶部 BGM 播放器条的 UI 事件
 *
 * 引用方式：每个 HTML 页面在 <body> 末尾加：
 *   <script type="module" src="/src/js/bgmInit.js"></script>
 */

import { bgmPlayer } from './controller/bgmPlayer.js';

function init() {
  const trackLabel = document.getElementById('bgm-track');
  const playBtn    = document.getElementById('bgm-play');
  const nextBtn    = document.getElementById('bgm-next');
  const volSlider  = document.getElementById('bgm-volume');

  if (!playBtn) return; // 页面没渲染播放器条（理论上不会发生）

  playBtn.addEventListener('click', () => bgmPlayer.toggle());
  nextBtn?.addEventListener('click', () => bgmPlayer.next());

  if (volSlider) {
    volSlider.value = bgmPlayer.volume;
    volSlider.addEventListener('input', (e) => bgmPlayer.setVolume(parseFloat(e.target.value)));
  }

  function updateUI(detail) {
    const track = detail?.track ?? bgmPlayer.getCurrentTrack();
    const playing = detail?.isPlaying ?? bgmPlayer.isPlaying;

    if (trackLabel) {
      trackLabel.textContent = track.artist
        ? `${track.artist} — ${track.title}`
        : track.title;
    }

    const icon = playBtn.querySelector('i');
    if (icon) icon.className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  document.addEventListener('bgm:change', (e) => updateUI(e.detail));
  updateUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
