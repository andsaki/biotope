/**
 * 星空エフェクトの定数
 */

// 星の数
export const STAR_COUNT = 5000;
export const REFLECTED_STAR_COUNT = 2000;

// 星の位置範囲
export const STAR_POSITION_RANGE = 100;

// 星の色設定
export const STAR_HUE = 0;
export const STAR_SATURATION = 0;
export const STAR_LIGHTNESS_MIN = 0.5;
export const STAR_LIGHTNESS_MAX = 1.0;

// 星のサイズ
export const STAR_SIZE_MIN = 0.2;
export const STAR_SIZE_MAX = 0.7;

// 星の回転速度
export const STAR_ROTATION_SPEED = 0.01;

// 星の表示遅延
export const STAR_DISPLAY_DELAY = 5000;

// 星のフェード速度
export const STAR_FADE_SPEED = 0.05;

// PointMaterial設定
export const STAR_MATERIAL = {
  size: 0.05,
  sizeAttenuation: true,
  depthWrite: false,
  fog: false,
} as const;

// 反射星の設定
export const REFLECTED_STAR_POSITION_Y = 8;
export const REFLECTED_STAR_SPREAD_X = 20;
export const REFLECTED_STAR_SPREAD_Z = 20;

// 反射星の波の設定
export const REFLECTED_STAR_WAVE_FREQUENCY = 0.5;
export const REFLECTED_STAR_WAVE_AMPLITUDE = 0.1;

// 反射星のマテリアル
export const REFLECTED_STAR_COLOR = "#FFFFFF";
export const REFLECTED_STAR_OPACITY = 0.5;
