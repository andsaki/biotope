/**
 * 雪エフェクトの定数
 */

// パーティクルの数
export const SNOW_COUNT = 200;

// 初期位置の範囲
export const SNOW_SPAWN_X_RANGE = 30;
export const SNOW_SPAWN_Y_RANGE = 20;
export const SNOW_SPAWN_Y_OFFSET = 5;
export const SNOW_SPAWN_Z_RANGE = 30;

// 落下速度
export const SNOW_VELOCITY_X_DRIFT = 0.1;
export const SNOW_VELOCITY_Y_BASE = 0.1;
export const SNOW_VELOCITY_Y_RANGE = 0.1;
export const SNOW_VELOCITY_Z_DRIFT = 0.1;

// アニメーション設定
export const SNOW_ANIMATION_SPEED = 60;
export const SNOW_WAVE_TIME_SCALE = 0.5;
export const SNOW_WAVE_AMPLITUDE = 0.02;
export const SNOW_WAVE_FREQUENCY_X = 0.1;
export const SNOW_WAVE_TIME_SCALE_Z = 0.3;
export const SNOW_WAVE_FREQUENCY_Z = 0.1;

// リセット設定
export const SNOW_RESET_Y_THRESHOLD = -1;
export const SNOW_RESET_X_RANGE = 30;
export const SNOW_RESET_Y_BASE = 20;
export const SNOW_RESET_Y_RANGE = 5;
export const SNOW_RESET_Z_RANGE = 30;

// マテリアル設定
export const SNOW_SIZE = 0.15;
export const SNOW_COLOR = "#FFFFFF";
export const SNOW_OPACITY = 0.8;
export const SNOW_ALPHA_TEST = 0.5;

// テクスチャ設定
export const SNOW_TEXTURE_SIZE = 32;
export const SNOW_TEXTURE_GRADIENT = {
  centerColor: "rgba(255, 255, 255, 1)",
  midColor: "rgba(255, 255, 255, 0.8)",
  edgeColor: "rgba(255, 255, 255, 0)",
} as const;

export const SNOW_TEXTURE_GRADIENT_CENTER = {
  x: 16,
  y: 16,
  innerRadius: 0,
  outerRadius: 16,
} as const;

export const SNOW_TEXTURE_GRADIENT_STOPS = {
  center: 0,
  mid: 0.3,
  edge: 1,
} as const;
