/**
 * 水草の定数
 */

// 蓮の葉のデータ
export const LILY_DATA: ReadonlyArray<{
  position: [number, number, number];
  rotation: number;
  scale: number;
  phaseOffset: number;
}> = [
  {
    position: [-4, 7.9, 1],
    rotation: 0,
    scale: 0.08,
    phaseOffset: 0,
  },
  {
    position: [3.5, 7.9, -0.5],
    rotation: Math.PI / 3,
    scale: 0.06,
    phaseOffset: 1.2,
  },
  {
    position: [0, 7.9, 2.5],
    rotation: Math.PI / 2,
    scale: 0.1,
    phaseOffset: 2.5,
  },
  {
    position: [-1.5, 7.9, -1.8],
    rotation: Math.PI / 6,
    scale: 0.07,
    phaseOffset: 3.8,
  },
];

// 水面の波の設定
export const WATER_HEIGHT_BASE = 8;
export const WATER_HEIGHT_AMPLITUDE = 0.5;
export const WATER_HEIGHT_FREQUENCY = 1.5;

// 蓮の葉の波紋設定
export const LILY_WAVE_FREQUENCY = 0.3;
export const LILY_WAVE_TIME_SCALE = 2.5;
export const LILY_WAVE_AMPLITUDE = 0.05;

// 蓮の葉の回転設定
export const LILY_ROTATION_TIME_SCALE = 0.3;
export const LILY_ROTATION_AMPLITUDE = 0.08;

// 蓮の葉の傾き設定
export const LILY_TILT_X_TIME_SCALE = 1.5;
export const LILY_TILT_X_AMPLITUDE = 0.03;
export const LILY_TILT_Z_TIME_SCALE = 1.5;
export const LILY_TILT_Z_PHASE_MULTIPLIER = 0.7;
export const LILY_TILT_Z_AMPLITUDE = 0.03;

// 水草の設定
export const WATER_PLANTS: ReadonlyArray<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}> = [
  {
    position: [-3, -1, -2],
    rotation: [0, 0, 0],
    scale: [0.3, 2.0, 0.3],
  },
  {
    position: [2, -1, -1],
    rotation: [0, Math.PI / 4, 0],
    scale: [0.25, 1.8, 0.25],
  },
  {
    position: [-2, -1, 2],
    rotation: [0, Math.PI / 2, 0],
    scale: [0.35, 2.2, 0.35],
  },
  {
    position: [3, -1, -3],
    rotation: [0, -Math.PI / 4, 0],
    scale: [0.2, 1.5, 0.2],
  },
];

// 水草のジオメトリ
export const WATER_PLANT_CYLINDER = {
  radiusTop: 0.1,
  radiusBottom: 0.3,
  height: 1,
  radialSegments: 8,
} as const;

// 季節ごとの水草の色
export const PLANT_COLORS = {
  spring: "#4CAF50",
  summer: "#2E7D32",
  autumn: "#558B2F",
  winter: "#1B5E20",
} as const;
