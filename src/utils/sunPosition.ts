/**
 * 太陽の位置を計算するユーティリティ関数
 */

/** 太陽の3D空間上の位置 */
export interface SunPosition {
  /** X座標 */
  x: number;
  /** Y座標（高さ） */
  y: number;
  /** Z座標 */
  z: number;
}

/**
 * 時間に基づいて太陽の位置を計算
 * @param hours 時間（0-23）
 * @param minutes 分（0-59）
 * @returns 太陽の3D座標
 */
export function calculateSunPosition(hours: number, minutes: number): SunPosition {
  const radius = 15; // 太陽の軌道半径
  const heightY = 15; // 太陽の高さ
  // 12時間サイクルで角度を計算、12時が上（-90度）になるように調整
  const angle = ((hours + minutes / 60) % 12) * (Math.PI / 6) - Math.PI / 2;

  return {
    x: radius * Math.cos(angle),
    y: heightY,
    z: radius * Math.sin(angle),
  };
}
