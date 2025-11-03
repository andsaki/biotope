import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useRealTime } from "../hooks/useRealTime";

/**
 * 時間コンテキストの型定義
 */
interface TimeContextType {
  /** 昼間かどうか */
  isDay: boolean;
  /** リアルタイム情報 */
  realTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

/**
 * 時間コンテキストのプロバイダー
 * リアルタイムの時刻と昼夜情報を子コンポーネントに提供
 */
export const TimeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isDay, realTime } = useRealTime();

  return (
    <TimeContext.Provider value={{ isDay, realTime }}>
      {children}
    </TimeContext.Provider>
  );
};

/**
 * 時間コンテキストを使用するカスタムフック
 * @returns 昼夜情報とリアルタイム情報
 * @throws TimeProviderの外で使用された場合にエラー
 */
export const useTime = (): TimeContextType => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error("useTime must be used within a TimeProvider");
  }
  return context;
};
