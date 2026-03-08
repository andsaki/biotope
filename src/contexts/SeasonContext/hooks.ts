import { useContext } from "react";
import { SeasonContext, type SeasonContextValue } from "./context";

/**
 * 季節コンテキストを使用するカスタムフック
 * @returns 季節の状態と更新関数
 * @throws SeasonProvider内で使用されていない場合はエラー
 */
export const useSeason = (): SeasonContextValue => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
};
