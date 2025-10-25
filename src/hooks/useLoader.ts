import { useState, useEffect } from "react";
import { LOADER_DISPLAY_DURATION } from "../constants";

/**
 * ローディング画面の表示を管理するカスタムフック
 * 一定時間後にローディング画面を非表示にする
 * @returns ローディング画面の表示状態
 */
export const useLoader = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, LOADER_DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return showLoader;
};
