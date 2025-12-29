// 雨エフェクトの定数設定

// 雨粒の数
export const RAIN_DROP_COUNT = 500;

// 雨粒のサイズ
export const RAIN_DROP_SIZE = {
  WIDTH: 0.02,
  HEIGHT: 0.3,
} as const;

// 雨粒の速度
export const RAIN_DROP_SPEED = {
  Y: -0.5, // 落下速度
  X_VARIATION: 0.05, // 風による横ブレ
} as const;

// 雨粒の生成範囲
export const RAIN_SPAWN_AREA = {
  X_MIN: -15,
  X_MAX: 15,
  Y: 20, // 高い位置から生成
  Z_MIN: -15,
  Z_MAX: 15,
} as const;

// 雨粒の色
export const RAIN_COLOR = '#b0c4de'; // 薄い青
export const RAIN_OPACITY = 0.6;
