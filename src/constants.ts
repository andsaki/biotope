export const SIMULATED_SECONDS_PER_REAL_SECOND = 48; // 1実秒あたりに進むシミュレーション秒数
export const WIND_CHANGE_INTERVAL = 10000; // 風向き変更間隔（ミリ秒）
export const LOADER_DISPLAY_DURATION = 3000; // ローディング表示時間（ミリ秒）

// 時間関連の定数
export const DAY_START_MINUTES = 300; // 午前5時（5 * 60）
export const DAY_END_MINUTES = 1080; // 午後6時（18 * 60）
export const INITIAL_TIME_MINUTES = 1020; // 午後5時（17 * 60）

// カラー定数
export const COLORS = {
  dayBackground: "#4A90E2",
  nightBackground: "#2A2A4E",
  sunColor: "#FFD700",
  waterColor: "#4A90E2",
  ambientLightDay: "#87CEEB",
  ambientLightNight: "#333333",
  directionalLightDay: "#FFD700",
  directionalLightNight: "#CCCCCC",
} as const;
