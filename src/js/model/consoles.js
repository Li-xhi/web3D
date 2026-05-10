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
    description: '掌机黄金时代的开端。8-bit CPU、单色 LCD、5 节 AA 电池能撑 30 小时。Tetris 让它走进千家万户。',
    modelPath: '/models/gameboy.glb',
    screenVideo: '/textures/screens/tetris.mp4',
    bgm: '/audio/tetris_bgm.mp3',
    materialStyle: 'matte_plastic',
    accentColor: '#8B0000',
    // 占位方块颜色（真实模型尚未加入时使用）
    placeholderColor: 0x808080,
    cameraPresets: [
      { name: '正面', position: [0, 0, 3], target: [0, 0, 0] },
      { name: '侧面', position: [3, 0, 0], target: [0, 0, 0] },
      { name: '按键特写', position: [0.5, -0.5, 1.5], target: [0.5, -0.5, 0] },
      { name: '俯视', position: [0, 3, 0.1], target: [0, 0, 0] },
    ],
  },
  {
    id: 'gba_sp',
    name: 'Game Boy Advance SP',
    year: 2003,
    manufacturer: 'Nintendo',
    description: '第一台带前置背光的 GB 系列掌机。翻盖设计、可充电锂电池、金属漆面机身。',
    modelPath: '/models/gba_sp.glb',
    screenVideo: '/textures/screens/pokemon.mp4',
    bgm: '/audio/pokemon_bgm.mp3',
    materialStyle: 'metallic_paint',
    accentColor: '#C0C0C0',
    hasFlipAnimation: true,
    placeholderColor: 0xb8860b,
    cameraPresets: [
      { name: '关闭状态', position: [0, 0.5, 3], target: [0, 0, 0] },
      { name: '打开状态', position: [0, 1, 3], target: [0, 0.5, 0] },
      { name: '侧面', position: [3, 0.5, 0], target: [0, 0.5, 0] },
      { name: '铰链特写', position: [0, 1.5, 1], target: [0, 1, 0] },
    ],
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    year: 2004,
    manufacturer: 'Sony',
    description: '索尼挑战任天堂掌机霸权之作。4.3 寸宽屏、UMD 光盘、Wi-Fi 联机。"几乎是 PS2 的便携版"。',
    modelPath: '/models/psp.glb',
    screenVideo: '/textures/screens/god_of_war.mp4',
    bgm: '/audio/psp_startup.mp3',
    materialStyle: 'piano_black',
    accentColor: '#000000',
    placeholderColor: 0x1a1a2e,
    cameraPresets: [
      { name: '正面', position: [0, 0, 4], target: [0, 0, 0] },
      { name: '侧面', position: [4, 0, 0], target: [0, 0, 0] },
      { name: 'UMD 仓', position: [0, 1, 2], target: [0, 0.5, 0] },
      { name: '按键特写', position: [-1, -0.3, 2], target: [-1, -0.3, 0] },
    ],
  },
];

/** 根据 id 查找掌机数据 */
export function findConsoleById(id) {
  return consoles.find((c) => c.id === id) ?? null;
}
