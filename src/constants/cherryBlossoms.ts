/**
 * 桜の花びらエフェクトの定数
 */

// パーティクルの数
export const PETAL_COUNT = 90;

// 初期位置の範囲
export const PETAL_SPAWN_X_RANGE = 20;
export const PETAL_SPAWN_Y_BASE = 4;
export const PETAL_SPAWN_Y_RANGE = 5;
export const PETAL_SPAWN_Z_RANGE = 15;

// 落下速度
export const PETAL_VELOCITY_X_DRIFT = 0.2;
export const PETAL_VELOCITY_Y_BASE = -0.18;
export const PETAL_VELOCITY_Y_RANGE = 0.12;
export const PETAL_VELOCITY_Z_DRIFT = 0.2;

// アニメーション速度
export const PETAL_ANIMATION_SPEED = 60;
export const PETAL_WAVE_AMPLITUDE = 0.01;
export const PETAL_ROTATION_SPEED = 0.05;

// リセット位置
export const PETAL_RESET_Y_THRESHOLD = 0;
export const PETAL_RESET_X_RANGE = 20;
export const PETAL_RESET_Y = 9;
export const PETAL_RESET_Z_RANGE = 15;

// マテリアル設定
export const PETAL_SIZE = 0.42;
export const PETAL_COLOR = "#FFB7D5";
export const PETAL_OPACITY = 0.9;
export const PETAL_ALPHA_TEST = 0.5;

// テクスチャ設定
export const PETAL_TEXTURE_SIZE = 32;
export const PETAL_TEXTURE_GRADIENT = {
  centerColor: "rgba(255, 200, 220, 1)",
  midColor: "rgba(255, 183, 213, 0.8)",
  edgeColor: "rgba(255, 183, 213, 0)",
} as const;

export const PETAL_TEXTURE_GRADIENT_CENTER = {
  x: 16,
  y: 16,
  innerRadius: 2,
  outerRadius: 16,
} as const;

export const PETAL_TEXTURE_GRADIENT_STOPS = {
  center: 0,
  mid: 0.5,
  edge: 1,
} as const;
