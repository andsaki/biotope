/** 魚の種類 */
export type FishType = "normal" | "flatfish";

/** 魚の状態データ */
export interface Fish {
  /** 魚のID */
  id: number;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** Z座標 */
  z: number;
  /** 移動速度 */
  speed: number;
  /** X方向の移動方向 */
  directionX: number;
  /** Y方向の移動方向 */
  directionY: number;
  /** 滑らかに旋回するための目標方向 */
  targetDirectionX: number;
  /** 天候や泳ぎの揺れを加える前の基準深度 */
  cruiseY: number;
  /** 魚ごとの上下移動の位相 */
  swimPhase: number;
  /** 次に進路を変更するまでの時間（秒） */
  directionChangeTime: number;
  /** 魚の色 */
  color: string;
  /** 魚のサイズ */
  size: number;
  /** 魚の種類 */
  type: FishType;
  /** フラットフィッシュの待機時間（秒） */
  waitTime?: number;
  /** フラットフィッシュが移動中かどうか */
  isMoving?: boolean;
}
