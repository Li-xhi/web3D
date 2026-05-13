# Handheld Heritage — 复古掌机 3D 博物馆

University of Sussex · 3D Apps · Assignment A2 · 2026

一个基于 Three.js 的交互式 3D 网页博物馆，展示三代经典便携游戏机的演化历程：
**Game Boy（1989）→ Game Boy Advance SP（2003）→ PlayStation Portable（2004）**

🌐 Live: [users.sussex.ac.uk/~xl434/](https://users.sussex.ac.uk/~xl434/)
📦 Code: [github.com/Li-xhi/web3D](https://github.com/Li-xhi/web3D)

---

## 运行步骤

```bash
# 安装依赖
npm install

# 启动开发服务器（自动打开浏览器）
npm run dev

# 构建生产版本（dist/）
npm run build
```

需要 Node.js 18+ 和现代浏览器（Chrome 100+ / Firefox 100+ / Edge 100+）。

部署到子路径（如 Sussex `~userid/`）：`vite.config.js` 中 `base: './'` 已配置，
直接把 `dist/` 内容传到目标目录即可。

---

## 功能列表

### 主页（index.html）
- **Hero Banner**：CSS 渐变光晕装饰背景 + 大标题入口
- **同页面 3 个 3D 模型预览**：每张卡片各自一个独立 Three.js 画布，
  各加载对应掌机的 GLB（满足"同一 HTML 页加载多个模型"的硬性要求）
- **Bootstrap 5 三列卡片**：响应式栅格，含掌机简介 / 年代 / 标签

### 展品页（gameboy.html / gba_sp.html / psp.html）
- **OrbitControls**：拖拽旋转、滚轮缩放、键盘方向键旋转（可访问性）
- **相机视角预设**：每台掌机 4 个预设，GSAP 1.2s 平滑过渡
- **GBA SP 翻盖动画**：Three.js `AnimationMixer` 播放 Blender 烘焙的 GLTF 内嵌动画，
  单向关闭动画通过 `timeScale = ±1` 实现可逆开/合；"Closed" 和 "Open" 相机预设
  亦驱动翻盖动画到对应姿态
- **Wireframe 切换**：一键查看模型线框结构
- **主光源开关**：切换主 DirectionalLight，观察明暗对比与材质反光
- **自动旋转**：OrbitControls `autoRotate` 自转开关
- **颜色染色**：原生 `<input type="color">` 实时染色，乘性 tint 保留贴图细节，
  Reset 恢复（首次染色前缓存原 `material.color`）
- **后期处理**：`EffectComposer` + `UnrealBloomPass` 让屏幕 / LED 发光
- **规格参数表 + 交互指南**：每台机器的硬件细节与控件说明

### 全站
- **持久化 BGM 播放器（顶部条）**：
  - 单例模式，3 首音乐通过 `consoles.js` 派生
  - sessionStorage 保存当前曲目 / 播放位置 / 音量 / 播放状态
  - 跨页面跳转不间断（受浏览器自动播放策略限制，首次需用户手势）
  - 自动下一首 + 手动 next + 音量调节
- **暗色博物馆主题**：CSS 变量系统（金色高亮 + 深色背景），高对比度
- **About 页**：开发过程 / 软件 / 挑战 / 测试反馈影响 / Deeper Understanding 陈述

---

## 文件结构

```
web3D/
├── index.html              # 主页（3 个卡片各嵌一个 3D 预览）
├── gameboy.html            # Game Boy 展品页
├── gba_sp.html             # GBA SP 展品页
├── psp.html                # PSP 展品页
├── about.html              # About 页（设计文档 + 测试反馈 + 提交链接）
├── package.json
├── vite.config.js          # base:'./' 多页面 rollupOptions
│
├── src/
│   ├── css/
│   │   ├── main.css        # 暗色博物馆主题（CSS 变量 + 响应式）
│   │   └── about.css       # About 页专属样式
│   │
│   └── js/
│       ├── bgmInit.js          # 顶部 BGM 条 DOM 绑定（每页加载）
│       ├── previewIndex.js     # 主页：扫描 canvas 调用预览模块
│       ├── previewViewer.js    # 主页卡片用的轻量 3D 预览
│       ├── viewer.js           # 展品页主入口（Controller 层）
│       │
│       ├── model/
│       │   └── consoles.js     # 三台掌机元数据（Model 层）
│       │
│       ├── view/
│       │   ├── scene.js        # Three.js 场景 / 相机 / 4 盏灯
│       │   ├── loader.js       # GLTFLoader + 占位方块兜底
│       │   ├── postprocess.js  # EffectComposer + Bloom
│       │   └── animations.js   # GSAP 相机过渡 + AnimationMixer 翻盖
│       │
│       └── controller/
│           ├── ui.js           # UI 事件绑定 + 状态同步
│           ├── bgmPlayer.js    # 单例 BGM 播放器（sessionStorage 持久化）
│           └── interaction.js  # 模型 raycaster / wireframe / 染色
│
└── assets/
    ├── models/             # 3 个 Blender 自制 GLB
    ├── bgm/                # 3 首背景音乐（mp3）
    └── about/              # About 页的 3 张过程图
```

---

## 技术栈

- **Three.js r176** — 3D 渲染、GLTFLoader、AnimationMixer、OrbitControls、PMREMGenerator
- **GSAP** — 相机过渡 / 按键按下动画
- **Bootstrap 5.3** — 响应式栅格 + 暗色主题基础
- **Vite 6** — 多页面打包（rollupOptions.input）+ `?raw` 着色器导入
- **原生 ES Modules** — 无 React/Vue，纯 MVC 手写

---

## MVC 架构

| 层 | 责任 | 目录 |
|----|------|------|
| **Model** | 数据来源，无渲染逻辑 | `src/js/model/` |
| **View** | Three.js 场景、加载、动画、后处理 | `src/js/view/` |
| **Controller** | UI 事件、交互、状态同步、BGM | `src/js/controller/` |

入口脚本（`viewer.js` / `previewIndex.js` / `bgmInit.js`）只负责装配各层。

---

## 提交链接（Assignment Required Evidence）

1. **Live 3D App** — [users.sussex.ac.uk/~xl434/](https://users.sussex.ac.uk/~xl434/)
2. **GitHub Codebase** — [github.com/Li-xhi/web3D](https://github.com/Li-xhi/web3D)
3. **GitHub Models** — [/assets/models/](https://github.com/Li-xhi/web3D/tree/main/assets/models)
4. **Deeper Understanding Statement** — 见 About 页 "Going beyond the lab tutorials" 章节
5. **Testing feedback impact** — 见 About 页 "What I tested and what changed" 章节

---

## 许可证

代码 MIT。3D 模型为本人在 Blender 中原创建模（详见 About 页 "How I made the three models"）。
