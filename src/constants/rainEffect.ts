// 雨エフェクトの定数設定

// 雨粒の数
export const RAIN_DROP_COUNT = 320;

// 雨粒のサイズ
export const RAIN_DROP_SIZE = {
  WIDTH: 0.006,
  HEIGHT: 0.16,
} as const;

// 雨粒の速度
export const RAIN_DROP_SPEED = {
  Y_BASE: 6.5, // 1秒あたりの落下速度
  Y_VARIATION: 2.5,
  X_BASE: -1.2, // 風による横流れ
  X_VARIATION: 0.7,
} as const;

// 雨粒の生成範囲
export const RAIN_SPAWN_AREA = {
  X_MIN: -15,
  X_MAX: 15,
  Y_MIN: 12,
  Y_MAX: 22,
  Z_MIN: -15,
  Z_MAX: 15,
} as const;

export const RAIN_RESET_Y = -1;
export const RAIN_DROP_TILT = -0.18;

// 雨粒の色
export const RAIN_COLOR = '#d9e6ff'; // 薄い青
export const RAIN_OPACITY = 0.32;
