import { createContext, useContext, useState, type ReactNode } from "react";

/** 季節の種類 */
type Season = "spring" | "summer" | "autumn" | "winter";

/** 季節コンテキストの型定義 */
interface SeasonContextType {
  /** 現在の季節 */
  season: Season;
  /** 季節を設定する関数 */
  setSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

/**
 * 現在の月から季節を判定する関数
 * @returns 現在の季節（春/夏/秋/冬）
 */
const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 0-11 → 1-12
  if (month >= 3 && month <= 5) return "spring";   // 3-5月: 春
  if (month >= 6 && month <= 8) return "summer";   // 6-8月: 夏
  if (month >= 9 && month <= 11) return "autumn";  // 9-11月: 秋
  return "winter";                                  // 12,1,2月: 冬
};

/**
 * 季節コンテキストのプロバイダーコンポーネント
 * リアルタイムの月に基づいて初期季節を設定
 * @param props - コンポーネントのプロパティ
 */
export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState<Season>(getCurrentSeason());

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};

/**
 * 季節コンテキストを使用するカスタムフック
 * @returns 季節の状態と更新関数
 * @throws SeasonProvider内で使用されていない場合はエラー
 */
export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
};
