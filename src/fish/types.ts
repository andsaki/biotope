/** 魚の種類 */
export type FishType = "normal" | "flatfish";

/** 通常魚の配色パターン */
export type FishColorPattern = "back" | "belly" | "flash";

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
  /** 行動の揺らぎを再現可能にするためのseed */
  movementSeed: number;
  /** 行動乱数の進行位置 */
  movementStep: number;
  /** 魚の色 */
  color: string;
  /** 魚の差し色 */
  accentColor: string;
  /** 魚の配色パターン */
  colorPattern: FishColorPattern;
  /** 差し色の明滅速度（個体差） */
  accentPulseSpeed: number;
  /** クリックで驚いた際に速度ブーストが残る秒数 */
  startleTime: number;
  /** 魚のサイズ */
  size: number;
  /** 魚の種類 */
  type: FishType;
  /** フラットフィッシュの待機時間（秒） */
  waitTime?: number;
  /** フラットフィッシュが移動中かどうか */
  isMoving?: boolean;
}
