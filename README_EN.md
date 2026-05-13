# Handheld Heritage — Retro Handheld 3D Museum

University of Sussex · 3D Apps · Assignment A2 · 2026

An interactive 3D web museum built with Three.js that showcases three generations of iconic portable game consoles:
**Game Boy (1989) → Game Boy Advance SP (2003) → PlayStation Portable (2004)**

🌐 Live: [users.sussex.ac.uk/~xl434/](https://users.sussex.ac.uk/~xl434/)
📦 Code: [github.com/Li-xhi/web3D](https://github.com/Li-xhi/web3D)
🇨🇳 中文版: [README.md](./README.md)

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server (auto-opens the browser)
npm run dev

# Build the production bundle (into dist/)
npm run build
```

Requires Node.js 18+ and a modern browser (Chrome 100+ / Firefox 100+ / Edge 100+).

For deployment under a sub-path (e.g. Sussex `~userid/`), `vite.config.js` already sets `base: './'`, so you can drop the contents of `dist/` straight into the target directory.

---

## Features

### Landing page (`index.html`)
- **Hero banner** with CSS gradient orbs and a large title
- **Three 3D model previews on a single page** — each card hosts an independent Three.js canvas loading its own GLB (satisfies the "more than one model on one HTML page" requirement)
- **Bootstrap 5 three-column cards** with responsive grid, console summary, year and tags

### Exhibit pages (`gameboy.html` / `gba_sp.html` / `psp.html`)
- **OrbitControls** — drag to rotate, scroll to zoom, arrow keys to rotate (accessibility)
- **Camera preset views** — four presets per console with 1.2 s GSAP eased transitions
- **GBA SP flip animation** — Three.js `AnimationMixer` plays the GLTF clip baked in Blender; the single one-way closing clip becomes a reversible open/close via `timeScale = ±1`; the "Closed" and "Open" camera presets also drive the lid to the matching pose
- **Wireframe toggle** — inspect the underlying mesh
- **Main light toggle** — flip the primary `DirectionalLight` to observe shading and material reflection
- **Auto-rotate** — uses OrbitControls' `autoRotate`
- **Colour tint + Reset** — a native `<input type="color">` tints the model in real time via multiplicative blending so textures stay legible; Reset restores the original colours (cached on first tint)
- **Post-processing** — `EffectComposer` + `UnrealBloomPass` make the screen and LEDs glow softly
- **Specifications table + interaction guide** describing each console's hardware and on-screen controls

### Site-wide
- **Persistent BGM player (top bar)**:
  - Singleton, three tracks derived from `consoles.js`
  - `sessionStorage` keeps current track, playback time, volume and play/pause across page navigation
  - Survives multi-page navigation seamlessly (subject to the browser's autoplay policy — first start needs a user gesture)
  - Auto-advance + manual Next + volume slider
- **Dark museum theme** — CSS variable system (gold accent on deep neutral background) with strong contrast
- **About page** — process, software, challenges, **testing-impact section**, and a **deeper-understanding statement**

---

## File structure

```
web3D/
├── index.html              # Landing page (3 embedded preview canvases)
├── gameboy.html            # Game Boy exhibit page
├── gba_sp.html             # GBA SP exhibit page
├── psp.html                # PSP exhibit page
├── about.html              # About page (development write-up + testing + links)
├── package.json
├── vite.config.js          # base:'./' + multi-page rollupOptions
│
├── src/
│   ├── css/
│   │   ├── main.css        # Dark museum theme (CSS variables + responsive)
│   │   └── about.css       # About page styles
│   │
│   └── js/
│       ├── bgmInit.js          # Top BGM-bar DOM binding (loaded by every page)
│       ├── previewIndex.js     # Landing page: scans canvases and inits previews
│       ├── previewViewer.js    # Lightweight 3D preview for the landing cards
│       ├── viewer.js           # Exhibit page entry point (Controller layer)
│       │
│       ├── model/
│       │   └── consoles.js     # Console metadata (Model layer)
│       │
│       ├── view/
│       │   ├── scene.js        # Three.js scene / cameras / 4 lights
│       │   ├── loader.js       # GLTFLoader with placeholder fallback
│       │   ├── postprocess.js  # EffectComposer + Bloom
│       │   └── animations.js   # GSAP camera tweens + AnimationMixer flip
│       │
│       └── controller/
│           ├── ui.js           # UI event wiring + state sync
│           ├── bgmPlayer.js    # Singleton BGM player (sessionStorage persistence)
│           └── interaction.js  # Model raycaster / wireframe / tint
│
└── assets/
    ├── models/             # 3 self-made Blender GLB files
    ├── bgm/                # 3 background music tracks (mp3)
    └── about/              # 3 process screenshots for the About page
```

---

## Tech stack

- **Three.js r176** — 3D rendering, GLTFLoader, AnimationMixer, OrbitControls, PMREMGenerator
- **GSAP** — camera tweens and button-press animations
- **Bootstrap 5.3** — responsive grid and base components
- **Vite 6** — multi-page bundler (`rollupOptions.input`) with `?raw` shader imports
- **Vanilla ES modules** — no React/Vue; a hand-written MVC structure

---

## MVC architecture

| Layer | Responsibility | Folder |
|-------|----------------|--------|
| **Model** | Pure data, no rendering | `src/js/model/` |
| **View** | Three.js scene, loaders, animations, post-processing | `src/js/view/` |
| **Controller** | UI events, interaction, state sync, BGM | `src/js/controller/` |

The entry scripts (`viewer.js` / `previewIndex.js` / `bgmInit.js`) only assemble the layers; they contain no rendering logic of their own.

---

## Submission links (assignment required evidence)

1. **Live 3D App** — [users.sussex.ac.uk/~xl434/](https://users.sussex.ac.uk/~xl434/)
2. **GitHub codebase** — [github.com/Li-xhi/web3D](https://github.com/Li-xhi/web3D)
3. **GitHub models folder** — [`/assets/models/`](https://github.com/Li-xhi/web3D/tree/main/assets/models)
4. **Deeper Understanding Statement** — see the *"Going beyond the lab tutorials"* section of the About page
5. **Testing feedback impact** — see the *"What I tested and what changed"* section of the About page

---

## References & Credits

### Software / libraries (used per their official documentation, unmodified)

- **[Three.js](https://threejs.org/)** r176 — 3D rendering core
  - Docs: <https://threejs.org/docs/>
  - Official examples (used as a reference for `GLTFLoader`, `AnimationMixer` and `OrbitControls`): <https://threejs.org/examples/>
- **[GSAP](https://greensock.com/gsap/)** — camera and button-press tweens
  - Docs: <https://greensock.com/docs/>
- **[Bootstrap 5.3](https://getbootstrap.com/)** — responsive grid and base components
  - Icons: <https://icons.getbootstrap.com/>
- **[Vite 6](https://vite.dev/)** — multi-page build tool
  - Multi-page build reference: <https://vite.dev/guide/build.html#multi-page-app>

### Video tutorial credits

Many thanks to the countless creators on [YouTube](https://www.youtube.com/) and [Bilibili](https://www.bilibili.com/) who publish Three.js getting-started tutorials, Blender hard-surface modelling walkthroughs and glTF export workflows — they helped me build a complete mental model from modelling all the way to web rendering. All project code was written independently.

### Documentation / written references

- MDN Web Docs — `<input type="color">`, `sessionStorage`, Audio API
  - <https://developer.mozilla.org/>
- Sussex 3D Apps lab handouts (Three.js fundamentals / Bootstrap layout)

### Asset attribution

- **3D models** — all three consoles were modelled from scratch by me in Blender (see the About page section *"How I made the three models"*)
- **Background music** — sourced from original Nintendo and Konami soundtracks, used for academic demonstration only
  - Koji Kondo — *Super Mario Bros. Underwater BGM* © Nintendo
  - Miki Higashino — *Yie Ar Kung-Fu* © Konami
  - Hidenori Maezawa & Seishimu — *Jungle Battle (Main BGM)* © Konami
- **Fonts / icons** — Bootstrap Icons (MIT) and the system default Segoe UI

---

## License

Code released under the MIT licence. The 3D models were created by me in Blender. Background music remains the property of the original rights holders.
