import React, { useMemo, memo, useState, useEffect, useCallback } from "react";

import { SeasonProvider, TimeProvider, useDayPeriod } from "./contexts";
import WindDirectionDisplay from "./components/WindDirectionDisplay";
import Loader from "./components/Loader";
import { PerformanceMonitorDisplay } from "./components/PerformanceMonitor";
import SceneCanvas from "./components/SceneCanvas";
import UI from "./components/UI";
import "./App.css";
import { useIsMobile } from "./hooks/useIsMobile";
import { useWindDirection } from "./hooks/useWindDirection";
import { useWeather } from "./hooks/useWeather";
import { useUxHints } from "./hooks/useUxHints";
import type { WindDirection } from "./utils/bottleJournal";

const isPerformanceMonitorRequested = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("perf") === "1";
};

const getWindDirectionFromDegrees = (
  degrees: number | null,
  fallback: WindDirection
): WindDirection => {
  if (degrees === null || !Number.isFinite(degrees)) {
    return fallback;
  }

  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return "North";
  if (normalized < 135) return "East";
  if (normalized < 225) return "South";
  return "West";
};

const MemoizedWindDirectionDisplay = memo(WindDirectionDisplay);

const MINIMUM_LOADER_MS = 300;
type AppStyle = React.CSSProperties & { "--app-background-color"?: string };

/**
 * アプリケーション内部コンポーネント
 * TimeProviderの中で時間情報を使用
 */
const AppContent = () => {
  const isDay = useDayPeriod();
  const simulatedWindDirection = useWindDirection();
  const { weather, locationStatus, requestPreciseLocation } = useWeather();
  const windDirection = useMemo(
    () => getWindDirectionFromDegrees(weather.windDirection, simulatedWindDirection),
    [simulatedWindDirection, weather.windDirection]
  );
  const uxHints = useUxHints();
  const isMobile = useIsMobile();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("初期化中...");
  const [waterSignal, setWaterSignal] = useState(0);
  const performanceMonitorEnabled = useMemo(isPerformanceMonitorRequested, []);
  const isLoading = !(assetsLoaded && minDelayElapsed);

  // 背景色をメモ化
  const backgroundColor = useMemo(() => isDay ? "#4A90E2" : "#2A2A4E", [isDay]);

  // 最低表示時間を確保
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayElapsed(true);
    }, MINIMUM_LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleAssetsLoaded = useCallback(() => {
    setAssetsLoaded(true);
    setLoadingProgress(100);
    setLoadingText("完了");
  }, []);

  const handleProgress = useCallback((progress: number, text: string) => {
    setLoadingProgress(progress);
    setLoadingText(text);
  }, []);

  const handleBottleMessageRead = useCallback(() => {
    uxHints.markBottleOpened();
  }, [uxHints]);

  const handleWaterInteract = useCallback(() => {
    uxHints.markWaterRippled();
    setWaterSignal((signal) => signal + 1);
  }, [uxHints]);

  const appStyle: AppStyle = {
    "--app-background-color": backgroundColor,
  };

  return (
    <div className="App" style={appStyle}>
      {showLoader && (
        <Loader
          progress={loadingProgress}
          loadingText={loadingText}
          isExiting={!isLoading}
        />
      )}
      <SceneCanvas
        backgroundColor={backgroundColor}
        isDay={isDay}
        isLoading={isLoading}
        isMobile={isMobile}
        performanceMonitorEnabled={performanceMonitorEnabled}
        showBottleHint={uxHints.shouldShowBottleHint}
        weather={weather}
        windDirection={windDirection}
        waterSignal={waterSignal}
        onAssetsLoaded={handleAssetsLoaded}
        onBottleMessageRead={handleBottleMessageRead}
        onProgress={handleProgress}
        onWaterInteract={handleWaterInteract}
      />
      {/* パフォーマンスモニター - 表示（Canvas外） - ローディング完了後のみ表示 */}
      {performanceMonitorEnabled && !isLoading && (
        <PerformanceMonitorDisplay enabled={performanceMonitorEnabled} />
      )}
      <UI
        showHints={!isLoading && uxHints.showHints}
        showUiHint={!isLoading && uxHints.shouldShowUiHint}
        showWaterHint={!isLoading && uxHints.shouldShowWaterHint}
        hintProgress={uxHints.progress}
        onDismissHints={uxHints.dismissHints}
        onReopenHints={!isLoading ? uxHints.reopenHints : undefined}
        onPanelOpened={uxHints.markPanelOpened}
        onAmbientToggle={uxHints.markAmbientToggled}
      />
      {/* 風向きコンパス - ローディング完了後のみ表示 */}
      {!isLoading && (
        <MemoizedWindDirectionDisplay
          windDirection={windDirection}
          weather={weather}
          locationStatus={locationStatus}
          onRequestPreciseLocation={requestPreciseLocation}
        />
      )}
    </div>
  );
};

/**
 * アプリケーションのルートコンポーネント
 * 各種Providerでラップ
 */
function App() {
  return (
    <TimeProvider>
      <SeasonProvider>
        <AppContent />
      </SeasonProvider>
    </TimeProvider>
  );
}

export default App;
