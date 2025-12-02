import { useContext } from "react";
import { DayPeriodContext, RealTimeContext, type RealTime } from "./context";

/**
 * 昼夜情報のみを提供するコンテキストフック
 * @returns 昼間かどうか
 * @throws Provider の外側で使用された場合にエラー
 */
export const useDayPeriod = (): boolean => {
  const context = useContext(DayPeriodContext);
  if (context === undefined) {
    throw new Error("useDayPeriod must be used within a TimeProvider");
  }
  return context;
};

/**
 * 現在時刻のみを提供するコンテキストフック
 * @returns 時刻情報（時/分/秒）
 * @throws Provider の外側で使用された場合にエラー
 */
export const useClockTime = (): RealTime => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error("useClockTime must be used within a TimeProvider");
  }
  return context;
};

/**
 * 昼夜と時刻の双方を返すヘルパーフック
 */
export const useTime = () => {
  const isDay = useDayPeriod();
  const realTime = useClockTime();
  return { isDay, realTime };
};
