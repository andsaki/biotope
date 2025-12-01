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
  SPRING: "#FF6347", // トマト
  SUMMER: "#FF4500", // オレンジレッド
  AUTUMN: "#DAA520", // ゴールデンロッド
  WINTER: "#4682B4", // スティールブルー
  DEFAULT: "#FF6347",
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
  SWIM_OSCILLATION_SPEED: 2, // 泳ぎの垂直振動速度
  SWIM_OSCILLATION_AMPLITUDE: 0.01, // 泳ぎの垂直振動幅
  DIRECTION_CHANGE_PROBABILITY: 0.005, // ランダムな方向変更確率
  DIRECTION_CHANGE_ANGLE_RANGE: Math.PI / 4, // 方向変更の角度範囲
  DIRECTION_CHANGE_ANGLE_OFFSET: Math.PI / 8, // 方向変更の角度オフセット
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
  NORMAL: 10,
  FLATFISH: 0.05,
} as const;

// 魚のモデル回転
export const FISH_MODEL_ROTATION = {
  NORMAL: Math.PI / 2, // 通常の魚は垂直方向に調整
  FLATFISH: 0, // フラットフィッシュは水平
  DIRECTION_OFFSET: Math.PI / 2, // 移動方向の回転オフセット
} as const;

// フラットフィッシュの透明度
export const FLATFISH_OPACITY = {
  MOVING_DAY: 0.9, // 移動中・昼
  WAITING_DAY: 0.6, // 待機中・昼（砂に擬態）
  NIGHT: 0.3, // 夜間
} as const;

// 通常の魚の透明度
export const NORMAL_FISH_OPACITY = 1.0;
