/**
 * 泡エフェクトの定数
 */

// 泡の数
export const BUBBLE_COUNT = 50;

// 泡のサイズ
export const BUBBLE_SIZE_MIN = 0.01;
export const BUBBLE_SIZE_MAX = 0.04;

// 泡の速度
export const BUBBLE_SPEED_MIN = 0.03;
export const BUBBLE_SPEED_MAX = 0.11;

// 泡のリセット
export const BUBBLE_RESET_Y_THRESHOLD = 8;
export const BUBBLE_START_Y = -1;

// 泡の放出位置
export const BUBBLE_LOCATIONS = [
  { x: -3.0, z: -3.0 },
  { x: 3.0, z: 0.0 },
  { x: -2.0, z: 3.0 },
  { x: -1.5, z: -2.0 },
  { x: 2.0, z: -1.5 },
  { x: -2.5, z: 1.5 },
  { x: 1.5, z: 2.0 },
  { x: -1.0, z: -1.0 },
  { x: 1.0, z: 1.0 },
  { x: 0.0, z: -2.5 },
] as const;

// 球体ジオメトリ
export const BUBBLE_SPHERE_WIDTH_SEGMENTS = 8;
export const BUBBLE_SPHERE_HEIGHT_SEGMENTS = 8;

// マテリアル設定
export const BUBBLE_COLOR = "#ADD8E6";
export const BUBBLE_OPACITY = 0.8;
