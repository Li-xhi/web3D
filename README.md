# Handheld Heritage — 复古掌机 3D 博物馆

University of Sussex · 3D Apps · Assignment A2 · 2026

一个基于 Three.js 的交互式 3D 网页博物馆，展示三代经典便携游戏机的演化历程：
**Game Boy（1989）→ Game Boy Advance SP（2003）→ PSP（2004）**

---

## 运行步骤

```bash
# 安装依赖
npm install

# 启动开发服务器（自动打开浏览器）
npm run dev

# 构建生产版本
npm run build
```

需要 Node.js 18+ 和现代浏览器（Chrome 100+ / Firefox 100+ / Safari 16+）。

---

## 功能列表

- **3D 模型展示**：三台掌机 PBR 材质，HDRi 环境反射
- **OrbitControls**：鼠标拖拽旋转、滚轮缩放、键盘方向键旋转
- **相机预设**：每台掌机 4 个预设视角，GSAP 平滑过渡
- **动态切换**：同一页面加载多个模型，切换时 fade 过渡
- **Wireframe 模式**：一键切换线框/实体显示
- **屏幕视频贴图**：VideoTexture 播放对应游戏画面
- **CRT Shader**：GLSL 扫描线 + RGB 偏移 + 桶形畸变
- **Bloom 后期处理**：UnrealBloomPass 屏幕发光效果
- **BGM**：每台机器对应不同背景音乐
- **GBA SP 翻盖动画**：GSAP easeInOutBack 缓动
- **键盘可访问性**：Tab 导航、ARIA 标签、对比度 ≥ 4.5:1

---

## 文件结构

```
web3D/
├── index.html              # 主展示页（3D 场景）
├── about.html              # About 页（设计文档）
├── package.json
├── vite.config.js
│
├── src/
│   ├── css/
│   │   ├── main.css        # 深色博物馆主题（CSS 自定义变量）
│   │   └── about.css       # About 页样式
│   │
│   ├── js/
│   │   ├── main.js         # 入口，协调 MVC 各层
│   │   ├── model/
│   │   │   └── consoles.js # 掌机元数据（Model 层）
│   │   ├── view/
│   │   │   ├── scene.js        # Three.js 场景初始化
│   │   │   ├── loader.js       # GLTF 动态加载
│   │   │   ├── postprocess.js  # Bloom 后期处理
│   │   │   └── animations.js   # GSAP 动画封装
│   │   └── controller/
│   │       ├── ui.js           # UI 事件绑定
│   │       ├── audio.js        # BGM 控制
│   │       └── interaction.js  # 模型点击、wireframe
│   │
│   └── shaders/
│       ├── crt.vert        # CRT shader 顶点
│       └── crt.frag        # CRT shader 片段（扫描线 + 偏色 + 畸变）
│
└── assets/
    ├── models/             # .glb 模型文件（待放入）
    ├── textures/
    │   ├── env.hdr         # HDRi 环境贴图
    │   └── screens/        # 屏幕视频（tetris.mp4 等）
    └── audio/              # BGM 音频文件
```

---

## 提交前自检清单

- [ ] 至少 3 个 3D 模型，材质各异
- [ ] 同一个 HTML 页面动态加载多个模型
- [ ] wireframe 切换按钮
- [ ] About 页面
- [ ] CSS3 + Bootstrap 流式布局
- [ ] 自定义 CSS 按钮样式
- [ ] 至少一个 GLSL shader（CRT）
- [ ] 后期处理（Bloom）
- [ ] 媒体集成（video + audio）
- [ ] 多个相机视角切换
- [ ] 灯光开关交互
- [ ] MVC 架构清晰
- [ ] GitHub commit 历史完整
- [ ] 浏览器兼容性测试记录
- [ ] 模型来源 CC Attribution 引用清晰

---

## Commit 规范

| 类型 | 说明 |
|------|------|
| `feat:` | 新功能 |
| `fix:` | Bug 修复 |
| `style:` | 样式调整 |
| `refactor:` | 代码重构 |
| `docs:` | 文档更新 |
| `chore:` | 依赖 / 配置 |

---

## 许可证

本项目代码 MIT 协议。3D 模型遵循原作者 CC BY 4.0 协议（详见 About 页面）。
