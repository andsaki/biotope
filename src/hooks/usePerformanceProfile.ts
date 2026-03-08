import { useMemo } from "react";
import {
  DEFAULT_PERFORMANCE_PROFILE,
  PERFORMANCE_PROFILES,
  type PerformanceProfile,
  type PerformanceTier,
} from "../constants/performance";
import { useIsMobile } from "./useIsMobile";

const detectHardwareTier = (): PerformanceTier => {
  if (typeof navigator === "undefined") {
    return "high";
  }

  const cores = navigator.hardwareConcurrency ?? 8;
  if (cores <= 4) return "low";
  if (cores <= 8) return "balanced";

  // 8コア超は余裕があるとみなす
  return "high";
};

/**
 * 画面サイズやハードウェアコア数を基準に描画負荷を段階的に調整するフック
 */
export const usePerformanceProfile = (): PerformanceProfile => {
  const isMobile = useIsMobile();

  return useMemo(() => {
    if (isMobile) {
      return PERFORMANCE_PROFILES.low;
    }

    const tier = detectHardwareTier();
    return PERFORMANCE_PROFILES[tier] ?? DEFAULT_PERFORMANCE_PROFILE;
  }, [isMobile]);
};
