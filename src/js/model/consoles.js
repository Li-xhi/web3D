/**
 * MVC — Model 层
 * 负责：三台掌机的元数据（纯数据，不含任何渲染逻辑）
 */

export const consoles = [
  {
    id: 'gameboy',
    name: 'Game Boy',
    year: 1989,
    manufacturer: 'Nintendo',
    description: 'The dawn of the handheld golden era. 8-bit CPU, monochrome LCD, ~30 hours on 4 AA batteries. Tetris brought it into millions of homes.',
    modelPath: 'models/gameboy_classic.glb',
    screenVideo: 'textures/screens/tetris.mp4',
    bgm: 'bgm/近藤浩治 - 水中BGM.mp3',
    materialStyle: 'matte_plastic',
    accentColor: '#8B0000',
    previewScale: 1.2,
    // 占位方块颜色（真实模型尚未加入时使用）
    placeholderColor: 0x808080,
    cameraPresets: [
      { name: 'Front', position: [0, 0, 3], target: [0, 0, 0] },
      { name: 'Side', position: [3, 0, 0], target: [0, 0, 0] },
      { name: 'Buttons', position: [0.5, -0.5, 1.5], target: [0.5, -0.5, 0] },
      { name: 'Top-down', position: [0, 3, 0.1], target: [0, 0, 0] },
    ],
  },
  {
    id: 'gba_sp',
    name: 'Game Boy Advance SP',
    year: 2003,
    manufacturer: 'Nintendo',
    description: 'The first GB-series handheld with a frontlit display. Clamshell design, rechargeable lithium battery, metallic-painted body.',
    modelPath: 'models/gameboy_advance_sp.glb',
    screenVideo: 'textures/screens/pokemon.mp4',
    bgm: 'bgm/東野美紀 - Yie Ar Kung-Fu.mp3',
    materialStyle: 'metallic_paint',
    accentColor: '#C0C0C0',
    previewScale: 1.2,
    hasFlipAnimation: true,
    placeholderColor: 0xb8860b,
    cameraPresets: [
      { name: 'Closed', position: [0, 0.5, 3], target: [0, 0, 0],   flipState: 'closed' },
      { name: 'Open',   position: [0, 1, 3],   target: [0, 0.5, 0], flipState: 'open'   },
      { name: 'Side',   position: [3, 0.5, 0], target: [0, 0.5, 0] },
      { name: 'Hinge',  position: [0, 1.5, 1], target: [0, 1, 0]   },
    ],
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    year: 2004,
    manufacturer: 'Sony',
    description: 'Sony\'s challenge to Nintendo\'s handheld dominance. 4.3" widescreen, UMD optical discs, Wi-Fi multiplayer — essentially "a portable PS2".',
    modelPath: 'models/sony_psp.glb',
    screenVideo: 'textures/screens/god_of_war.mp4',
    bgm: 'bgm/前沢秀憲 禎清宏 - 密林の戦い (メインBGM).mp3',
    materialStyle: 'piano_black',
    accentColor: '#000000',
    previewScale: 3.0,
    placeholderColor: 0x1a1a2e,
    cameraPresets: [
      { name: 'Front', position: [0, 0, 4], target: [0, 0, 0] },
      { name: 'Side', position: [4, 0, 0], target: [0, 0, 0] },
      { name: 'UMD bay', position: [0, 1, 2], target: [0, 0.5, 0] },
      { name: 'Buttons', position: [-1, -0.3, 2], target: [-1, -0.3, 0] },
    ],
  },
];

/** 根据 id 查找掌机数据 */
export function findConsoleById(id) {
  return consoles.find((c) => c.id === id) ?? null;
}
