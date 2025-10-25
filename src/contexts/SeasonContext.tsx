import { createContext, useContext, useState, type ReactNode } from "react";

type Season = "spring" | "summer" | "autumn" | "winter";

interface SeasonContextType {
  season: Season;
  setSeason: (season: Season) => void;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

// 現在の月から季節を判定する関数
const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 0-11 → 1-12
  if (month >= 3 && month <= 5) return "spring";   // 3-5月: 春
  if (month >= 6 && month <= 8) return "summer";   // 6-8月: 夏
  if (month >= 9 && month <= 11) return "autumn";  // 9-11月: 秋
  return "winter";                                  // 12,1,2月: 冬
};

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState<Season>(getCurrentSeason());

  return (
    <SeasonContext.Provider value={{ season, setSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
};
