/**
 * パーティクルシステムの定数
 */

// 季節ごとのパーティクル数
export const PARTICLE_COUNT = {
  SPRING: 15,
  SUMMER: 10,
  AUTUMN: 5,
  WINTER: 20,
  DEFAULT: 15,
} as const;

// 季節ごとのパーティクル色
export const PARTICLE_COLOR = {
  SPRING: "#FFB6C1", // ライトピンク (花びら)
  SUMMER: "#98FB98", // ペールグリーン (葉)
  AUTUMN: "#FFA500", // オレンジ (落ち葉)
  WINTER: "#FFFFFF", // ホワイト (雪)
  DEFAULT: "#FFB6C1",
} as const;

// 季節ごとの落下速度範囲 (Y軸)
export const PARTICLE_SPEED_Y = {
  SPRING: [0.025, 0.05] as [number, number],
  SUMMER: [0.01, 0.025] as [number, number],
  AUTUMN: [0.005, 0.015] as [number, number],
  WINTER: [0.005, 0.015] as [number, number],
  DEFAULT: [0.025, 0.05] as [number, number],
} as const;

// 季節ごとのサイズ倍率
export const PARTICLE_SIZE_MODIFIER = {
  SPRING: 1.0,
  SUMMER: 0.5,
  AUTUMN: 1.2,
  WINTER: 0.5,
  DEFAULT: 1.0,
} as const;

// パーティクルのベースサイズ範囲
export const PARTICLE_BASE_SIZE_MIN = 0.03;
export const PARTICLE_BASE_SIZE_VARIATION = 0.07;

// パーティクルの初期位置範囲
export const PARTICLE_SPAWN = {
  X_MIN: -5,
  X_MAX: 5,
  Y_MAX: 5,
  Z_MIN: -2.5,
  Z_MAX: 2.5,
} as const;

// パーティクルの横方向速度範囲
export const PARTICLE_SPEED_X_MIN = -0.01;
export const PARTICLE_SPEED_X_MAX = 0.02;
export const PARTICLE_SPEED_Z_MIN = -0.01;
export const PARTICLE_SPEED_Z_MAX = 0.02;

// パーティクルの寿命
export const PARTICLE_LIFE_MIN = 100;
export const PARTICLE_LIFE_VARIATION = 100;

// パーティクルのリセット閾値
export const PARTICLE_RESET_Y = -2;

// フレームスキップ（パフォーマンス最適化）
export const PARTICLE_FRAME_SKIP = 2;

// フレームスキップによる速度調整倍率
export const PARTICLE_SPEED_MULTIPLIER = 2;

// パーティクルの透明度
export const PARTICLE_OPACITY = 0.8;

// 季節ごとのジオメトリサイズ倍率
export const PARTICLE_GEOMETRY_SIZE = {
  SPRING_WIDTH: 0.15,  // 桜の花びら (幅)
  SPRING_HEIGHT: 0.10, // 桜の花びら (高さ)
  AUTUMN_WIDTH: 0.12,  // 落ち葉 (幅)
  AUTUMN_HEIGHT: 0.18, // 落ち葉 (高さ)
  WINTER_SEGMENTS: 8, // 雪の球体の分割数
  SUMMER_SEGMENTS: 6, // 夏の球体の分割数
} as const;
