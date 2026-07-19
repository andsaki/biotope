/**
 * 魚の動作・表示に関する定数
 */

// 通常の魚の数
export const NORMAL_FISH_COUNT = 10;

// フラットフィッシュ（底生魚）の数
export const FLATFISH_COUNT = 3;

// 季節ごとの魚の速度
export const FISH_SPEED = {
  SPRING: 0.015,
  SUMMER: 0.02,
  AUTUMN: 0.01,
  WINTER: 0.005,
  DEFAULT: 0.015,
} as const;

// 季節ごとの魚の色
export const FISH_COLOR = {
  SPRING: "#c37f8f",
  SUMMER: "#4f9f8e",
  AUTUMN: "#b47a3d",
  WINTER: "#5f88ad",
  DEFAULT: "#c37f8f",
} as const;

export const FISH_ACCENT_COLOR = {
  SPRING: "#ffe0b5",
  SUMMER: "#d8f4a0",
  AUTUMN: "#e15d3f",
  WINTER: "#c8f2ff",
  DEFAULT: "#ffe0b5",
} as const;

// 通常の魚の配置範囲
export const NORMAL_FISH_SPAWN = {
  X_MIN: -5,
  X_MAX: 5,
  Y_MIN: 0.0,
  Y_MAX: 8.0,
  Z_MIN: -1.5,
  Z_MAX: 3.0,
} as const;

// 通常の魚の速度のバリエーション
export const NORMAL_FISH_SPEED_VARIATION = 0.02;

// 通常の魚のサイズ範囲
export const NORMAL_FISH_SIZE_MIN = 0.2;
export const NORMAL_FISH_SIZE_VARIATION = 0.3;

// 差し色の明滅速度の個体差
export const NORMAL_FISH_ACCENT_PULSE_SPEED_MIN = 3.2;
export const NORMAL_FISH_ACCENT_PULSE_SPEED_MAX = 4.6;
export const FLATFISH_ACCENT_PULSE_SPEED_MIN = 2.2;
export const FLATFISH_ACCENT_PULSE_SPEED_MAX = 3.0;

// フラットフィッシュの配置
export const FLATFISH_GROUND_Y = -0.9; // 地面に密着

// フラットフィッシュの速度（瞬間移動時）
export const FLATFISH_SPEED = 0.2;

// フラットフィッシュのサイズ範囲
export const FLATFISH_SIZE_MIN = 1.5;
export const FLATFISH_SIZE_VARIATION = 0.5;

// フラットフィッシュの待機時間（秒）
export const FLATFISH_WAIT_TIME_MIN = 10;
export const FLATFISH_WAIT_TIME_VARIATION = 10;

// フラットフィッシュの移動時間（秒）
export const FLATFISH_MOVE_TIME_MIN = 0.3;
export const FLATFISH_MOVE_TIME_VARIATION = 0.2;

// 魚の動きのパラメータ
export const FISH_MOVEMENT = {
  FRAME_MULTIPLIER: 60, // delta * 60
  Z_DRIFT_DAMPING: 0.2, // 通常の魚のZ方向移動の減衰
  SWIM_OSCILLATION_SPEED: 0.7, // 深度を緩やかに変える速度
  SWIM_OSCILLATION_AMPLITUDE: 0.16, // 基準深度からの上下移動幅
  DIRECTION_CHANGE_INTERVAL_MIN: 2.5, // 次の進路を選ぶまでの最短時間（秒）
  DIRECTION_CHANGE_INTERVAL_VARIATION: 4, // 進路変更間隔のばらつき（秒）
  DIRECTION_CHANGE_ANGLE_RANGE: Math.PI / 2.8, // 1回の進路変更角度
  TURN_DAMPING: 1.8, // 目標方向へ旋回する滑らかさ
  DEPTH_DAMPING: 1.4, // 目標深度へ移動する滑らかさ
  BOUNDARY_MARGIN: 1.1, // 境界へ到達する前に内側へ向き始める距離
  FLATFISH_TURN_DAMPING: 3.2, // ヒラメが目標方向へ向きを変える滑らかさ
  FLATFISH_BOUNDARY_MARGIN: 0.9, // ヒラメが境界前に内側へ向き始める距離
  FLATFISH_Z_DRIFT_DAMPING: 0.6, // ヒラメの奥行き方向移動の減衰
} as const;

// 魚の境界
export const FISH_BOUNDARY = {
  X_MIN: -6.0,
  X_MAX: 6.0,
  Y_MIN: 0.0,
  Y_MAX: 8.0,
  Z_MIN: -1.5,
  Z_MAX: 3.0,
} as const;

// 魚のモデルスケール
export const FISH_MODEL_SCALE = {
  NORMAL: 0.42,
  FLATFISH: 0.05,
} as const;

// 魚のモデル回転
export const FISH_MODEL_ROTATION = {
  NORMAL: 0, // 通常魚OBJはY軸が上
  FLATFISH: 0, // フラットフィッシュは水平
  DIRECTION_OFFSET: Math.PI / 2, // 移動方向の回転オフセット
} as const;

// ヒラメモデルのローポリ風マテリアル
export const FLATFISH_LOW_POLY_MATERIAL = {
  BASE_COLOR: "#7d6a4f",
  ACCENT_COLOR: "#9a805b",
  ROUGHNESS: 1,
} as const;
