/**
 * デバイス特性に応じて負荷を自動調整するためのプロファイル定義
 */
export type PerformanceTier = "high" | "balanced" | "low";

export interface PerformanceProfile {
  /** プロファイル種別 */
  tier: PerformanceTier;
  /** パーティクル数に掛ける倍率 */
  particleCountMultiplier: number;
  /** 雲インスタンス数に掛ける倍率 */
  cloudCountMultiplier: number;
  /** 雲を構成する球の数に掛ける倍率 */
  cloudPartMultiplier: number;
  /** 落ち葉インスタンス数に掛ける倍率 */
  leafCountMultiplier: number;
  /** 泡エフェクトの数に掛ける倍率 */
  bubbleCountMultiplier: number;
}

export const PERFORMANCE_PROFILES: Record<PerformanceTier, PerformanceProfile> = {
  high: {
    tier: "high",
    particleCountMultiplier: 1,
    cloudCountMultiplier: 1,
    cloudPartMultiplier: 1,
    leafCountMultiplier: 1,
    bubbleCountMultiplier: 1,
  },
  balanced: {
    tier: "balanced",
    particleCountMultiplier: 0.75,
    cloudCountMultiplier: 0.7,
    cloudPartMultiplier: 0.75,
    leafCountMultiplier: 0.7,
    bubbleCountMultiplier: 0.7,
  },
  low: {
    tier: "low",
    particleCountMultiplier: 0.5,
    cloudCountMultiplier: 0.45,
    cloudPartMultiplier: 0.5,
    leafCountMultiplier: 0.45,
    bubbleCountMultiplier: 0.5,
  },
};

export const DEFAULT_PERFORMANCE_PROFILE = PERFORMANCE_PROFILES.high;
