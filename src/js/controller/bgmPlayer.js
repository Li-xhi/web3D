/**
 * MVC — Controller 层
 * 全站共用的 BGM 播放器（单例）
 *
 * 关键特性：
 *   - 持久化到 sessionStorage：页面跳转后续播曲目和位置（受浏览器自动播放策略限制）
 *   - 列表自动从 consoles.js 派生（3 台掌机的 BGM）
 *   - 自动下一首（曲终切歌）+ 手动 next + 音量控制
 *   - 通过自定义事件 'bgm:change' 通知 UI 刷新
 *
 * 不在这里操作 DOM —— 由 bgmInit.js 在每个页面绑定 UI 元素。
 */

import { consoles } from '../model/consoles.js';

const STORAGE_KEY = 'bgmPlayerState';

/* 从文件名派生显示用标题：
   "近藤浩治 - 水中BGM.mp3" → { artist: "近藤浩治", title: "水中BGM" } */
function parseFilename(path) {
  const filename = decodeURIComponent(path.split('/').pop()).replace(/\.mp3$/i, '');
  const parts = filename.split(' - ');
  if (parts.length >= 2) {
    return { artist: parts[0], title: parts.slice(1).join(' - ') };
  }
  return { artist: '', title: filename };
}

const TRACKS = consoles.map((c) => {
  const meta = parseFilename(c.bgm);
  return {
    src: c.bgm,
    consoleName: c.name,
    artist: meta.artist,
    title: meta.title,
  };
});

class BgmPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 0.5;

    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('timeupdate', () => this._throttledSave());

    this._loadState();
    this._loadTrack(this.currentIndex, /*resumeTime=*/ this._savedTime);

    // 尝试恢复播放（浏览器可能因自动播放策略阻止，失败后等用户手势）
    if (this.isPlaying) {
      this.audio.play().catch(() => { this.isPlaying = false; this._notify(); });
    }
  }

  /* ---- 状态持久化 ---- */
  _loadState() {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
      this.currentIndex = Number.isInteger(s.currentIndex) ? s.currentIndex : 0;
      this.volume       = typeof s.volume === 'number' ? s.volume : 0.5;
      this.isPlaying    = !!s.isPlaying;
      this._savedTime   = typeof s.currentTime === 'number' ? s.currentTime : 0;
    } catch {
      this.currentIndex = 0;
      this.volume = 0.5;
      this.isPlaying = false;
      this._savedTime = 0;
    }
    if (this.currentIndex < 0 || this.currentIndex >= TRACKS.length) this.currentIndex = 0;
  }

  _saveState() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentIndex: this.currentIndex,
      volume:       this.volume,
      isPlaying:    this.isPlaying,
      currentTime:  this.audio.currentTime || 0,
    }));
  }

  /* timeupdate 频率高，节流到 ~1 次/秒避免 storage 写入过频 */
  _throttledSave() {
    const now = performance.now();
    if (now - (this._lastSave ?? 0) < 1000) return;
    this._lastSave = now;
    this._saveState();
  }

  _loadTrack(index, resumeTime = 0) {
    this.currentIndex = index;
    this.audio.src = encodeURI(TRACKS[index].src);
    this.audio.volume = this.volume;
    if (resumeTime > 0) {
      this.audio.addEventListener('loadedmetadata', () => {
        this.audio.currentTime = Math.min(resumeTime, this.audio.duration - 0.5);
      }, { once: true });
    }
  }

  /* ---- 公共控制 ---- */
  play() {
    this.isPlaying = true;
    this.audio.play().catch(() => {
      console.warn('[bgm] 浏览器阻止播放，请用户手势触发');
      this.isPlaying = false;
      this._notify();
    });
    this._saveState();
    this._notify();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
    this._saveState();
    this._notify();
  }

  toggle() { this.isPlaying ? this.pause() : this.play(); }

  next() {
    const wasPlaying = this.isPlaying;
    const nextIdx = (this.currentIndex + 1) % TRACKS.length;
    this._loadTrack(nextIdx);
    if (wasPlaying) this.audio.play().catch(() => {});
    this._saveState();
    this._notify();
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.audio.volume = this.volume;
    this._saveState();
  }

  getCurrentTrack() { return TRACKS[this.currentIndex]; }

  /* ---- 事件分发：UI 监听此事件刷新显示 ---- */
  _notify() {
    document.dispatchEvent(new CustomEvent('bgm:change', {
      detail: {
        track: this.getCurrentTrack(),
        isPlaying: this.isPlaying,
        index: this.currentIndex,
      },
    }));
  }
}

/* 单例：每次模块导入返回同一个实例（每个页面是新页面 = 新模块加载，但状态从 sessionStorage 恢复） */
export const bgmPlayer = new BgmPlayer();
