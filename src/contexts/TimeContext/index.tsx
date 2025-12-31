/* eslint-disable react-refresh/only-export-components */
import React from "react";
import type { ReactNode } from "react";
import { useRealTime } from "../../hooks/useRealTime";
import { DayPeriodContext, RealTimeContext } from "./context";

export type { RealTime } from "./context";

/**
 * 時間コンテキストのプロバイダー
 * リアルタイムの時刻と昼夜情報を子コンポーネントに提供
 */
export const TimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isDay, realTime } = useRealTime();

  return (
    <DayPeriodContext.Provider value={isDay}>
      <RealTimeContext.Provider value={realTime}>
        {children}
      </RealTimeContext.Provider>
    </DayPeriodContext.Provider>
  );
};

export { useDayPeriod, useClockTime, useTime } from "./hooks";
