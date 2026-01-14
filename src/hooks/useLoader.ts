import { useState, useEffect } from "react";
import { DefaultLoadingManager } from "three";
import { LOADER_DISPLAY_DURATION } from "../constants";

/**
 * ローディング画面の表示を管理するカスタムフック
 * Three.jsのアセット読み込み進捗を追跡し、一定時間後にローディング画面を非表示にする
 * @returns ローディング画面の表示状態と読み込み進捗
 */
export const useLoader = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("初期化中...");

  useEffect(() => {
    let isLoaded = false;

    // Three.jsのDefaultLoadingManagerで読み込み進捗を追跡
    DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(`Loading started: ${itemsLoaded}/${itemsTotal} - ${url}`);
      setLoadingText("3Dモデルを読み込み中...");
    };

    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percentComplete = (itemsLoaded / itemsTotal) * 100;
      setProgress(percentComplete);
      console.log(`Loading progress: ${itemsLoaded}/${itemsTotal} (${Math.round(percentComplete)}%) - ${url}`);
    };

    DefaultLoadingManager.onLoad = () => {
      console.log("All assets loaded");
      setProgress(100);
      setLoadingText("完了");
      isLoaded = true;

      // すべて読み込まれたら少し待ってから非表示
      setTimeout(() => {
        setShowLoader(false);
      }, 800);
    };

    DefaultLoadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
      setLoadingText("読み込みエラー");
    };

    // フォールバック: 指定時間後に強制的に非表示
    const fallbackTimer = setTimeout(() => {
      if (!isLoaded) {
        setProgress(100);
        setShowLoader(false);
      }
    }, LOADER_DISPLAY_DURATION);

    return () => {
      clearTimeout(fallbackTimer);
      // クリーンアップ
      DefaultLoadingManager.onStart = () => {};
      DefaultLoadingManager.onProgress = () => {};
      DefaultLoadingManager.onLoad = () => {};
      DefaultLoadingManager.onError = () => {};
    };
  }, []);

  return { showLoader, progress, loadingText };
};
