import { useMemo } from "react";
import { useClockTime } from "../contexts";
import { calculateSunPosition } from "../utils/sunPosition";

/**
 * 現在時刻から太陽の位置を算出するフック
 * @returns SunPosition
 */
export const useSunPosition = () => {
  const { hours, minutes, seconds } = useClockTime();

  return useMemo(
    () => calculateSunPosition(hours, minutes + seconds / 60),
    [hours, minutes, seconds]
  );
};
