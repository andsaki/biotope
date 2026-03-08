import { createContext } from "react";

/** 季節の種類 */
export type Season = "spring" | "summer" | "autumn" | "winter";

/** 季節コンテキストの型定義 */
export interface SeasonContextValue {
  /** 現在の季節 */
  season: Season;
  /** 季節を設定する関数 */
  setSeason: (season: Season) => void;
}

export const SeasonContext = createContext<SeasonContextValue | undefined>(
  undefined
);
