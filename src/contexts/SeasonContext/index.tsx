/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState, type ReactNode } from "react";
import { SeasonContext, type Season, type SeasonContextValue } from "./context";
export type { Season, SeasonContextValue } from "./context";
export { useSeason } from "./hooks";

/**
 * 現在の月から季節を判定する関数
 * @returns 現在の季節（春/夏/秋/冬）
 */
const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 0-11 → 1-12
  if (month >= 3 && month <= 5) return "spring"; // 3-5月: 春
  if (month >= 6 && month <= 8) return "summer"; // 6-8月: 夏
  if (month >= 9 && month <= 11) return "autumn"; // 9-11月: 秋
  return "winter"; // 12,1,2月: 冬
};

/**
 * 季節コンテキストのプロバイダーコンポーネント
 * リアルタイムの月に基づいて初期季節を設定
 * @param props - コンポーネントのプロパティ
 */
export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState<Season>(getCurrentSeason());
  const value = useMemo<SeasonContextValue>(
    () => ({ season, setSeason }),
    [season]
  );

  return (
    <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
  );
};
