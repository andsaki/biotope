import { createContext } from "react";

/** 現在時刻の型定義 */
export interface RealTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export const DayPeriodContext = createContext<boolean | undefined>(undefined);
export const RealTimeContext = createContext<RealTime | undefined>(undefined);
