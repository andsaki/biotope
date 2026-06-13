import React, { Suspense, useRef, useMemo, memo, useState, useEffect, useCallback } from "react";

import { SeasonProvider, TimeProvider, useDayPeriod } from "./contexts";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayerInstanced from "./components/ParticleLayerInstanced";
import Clouds from "./components/Clouds";
import WindDirectionDisplay from "./components/WindDirectionDisplay";
import Ground from "./components/Ground";
import Stars from "./components/Stars";
import ShootingStars from "./components/ShootingStars";
import ReflectedStars from "./components/ReflectedStars";
import WaterSurface from "./components/WaterSurface";
import LightingController from "./components/LightingController";
import SundialGnomon from "./components/SundialGnomon";
import SundialBase from "./components/SundialBase";
import Loader from "./components/Loader";
import { DriftingBottle } from "./components/DriftingBottle";
import { Sun } from "./components/Sun";
import { SceneLights } from "./components/SceneLights";
import { SeasonalEffects } from "./components/SeasonalEffects";
// import { DebugHelpers } from "./components/DebugHelpers"; // デバッグヘルパーは削除
import { PerformanceMonitorCollector, PerformanceMonitorDisplay } from "./components/PerformanceMonitor";

const WaterPlantsLarge = React.lazy(
  () => import("./components/WaterPlantsLarge")
);
const PottedPlant = React.lazy(() => import("./components/PottedPlant"));
const Rocks = React.lazy(() => import("./components/Rocks"));
const BubbleEffect = React.lazy(() => import("./components/BubbleEffect"));

import UI from "./components/UI";
import "./App.css";
import { SIMULATED_SECONDS_PER_REAL_SECOND } from "./constants/core";
import { useIsMobile } from "./hooks/useIsMobile";
import { useWindDirection } from "./hooks/useWindDirection";
import { useWeather } from "./hooks/useWeather";
import { useUxHints } from "./hooks/useUxHints";

// const DEBUG_MODE = false; // デバッグヘルパーの表示切替 - 削除
const PERFORMANCE_MONITOR = import.meta.env.DEV; // 開発モードで自動的に有効化

// メモ化されたコンポーネント
const MemoizedGround = memo(Ground);
const MemoizedFishManager = memo(FishManager);
const MemoizedParticleLayerInstanced = memo(ParticleLayerInstanced);
const MemoizedClouds = memo(Clouds);
const MemoizedStars = memo(Stars);
const MemoizedShootingStars = memo(ShootingStars);
const MemoizedReflectedStars = memo(ReflectedStars);
const MemoizedWaterSurface = memo(WaterSurface);
// SundialGnomonは内部で太陽位置を参照するのでメモ化のみ行う
const MemoizedSundialGnomon = memo(SundialGnomon);
const MemoizedSundialBase = memo(SundialBase);
const MemoizedDriftingBottle = memo(DriftingBottle);
const MemoizedSeasonalEffects = memo(SeasonalEffects);
const MemoizedWindDirectionDisplay = memo(WindDirectionDisplay);

/**
 * Canvas内でThree.jsの読み込み状況を監視し、完了時に親へ通知
 */
const LoadingTracker = ({
  onLoaded,
  onProgress
}: {
  onLoaded: () => void;
  onProgress: (progress: number, loadingText: string) => void;
}) => {
  const { active, progress, loaded, total } = useProgress();

  useEffect(() => {
    if (active) {
      const percentComplete = (loaded / total) * 100;
      const text = `3Dモデルを読み込み中... (${loaded}/${total})`;
      onProgress(percentComplete, text);
    } else {
      onProgress(100, "完了");
      onLoaded();
    }
  }, [active, progress, loaded, total, onLoaded, onProgress]);

  return null;
};

const MINIMUM_LOADER_MS = 300;
type AppStyle = React.CSSProperties & { "--app-background-color"?: string };

/**
 * アプリケーション内部コンポーネント
 * TimeProviderの中で時間情報を使用
 */
const AppContent = () => {
  const isDay = useDayPeriod();
  const windDirection = useWindDirection();
  const weather = useWeather();
  const uxHints = useUxHints();
  const isMobile = useIsMobile();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("初期化中...");
  const isLoading = !(assetsLoaded && minDelayElapsed);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

  // 背景色をメモ化
  const backgroundColor = useMemo(() => isDay ? "#4A90E2" : "#2A2A4E", [isDay]);
  const cameraConfig = useMemo(
    () => ({
      position: [5, 3, 0] as [number, number, number],
      fov: isMobile ? 75 : 70,
    }),
    [isMobile]
  );
  const rendererConfig = useMemo(
    () => ({
      antialias: !isMobile,
      powerPreference: "high-performance" as const,
      alpha: false,
      stencil: false,
    }),
    [isMobile]
  );
  const canvasDpr = useMemo<[number, number]>(
    () => (isMobile ? [0.75, 1.25] : [1, 1.75]),
    [isMobile]
  );

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

  const appStyle: AppStyle = {
    "--app-background-color": backgroundColor,
  };

  return (
      <div
        className="App"
        style={appStyle}
      >
        {showLoader && (
          <Loader
            progress={loadingProgress}
            loadingText={loadingText}
            isExiting={!isLoading}
          />
        )}
        <Canvas
          className="App-canvas"
          camera={cameraConfig}
          gl={rendererConfig}
          dpr={canvasDpr}
          frameloop="always" // 常にレンダリング
          performance={{ min: 0.5 }} // パフォーマンス低下時の最小品質
        >
          {/* Three.jsローダーの完了を検知 */}
          <LoadingTracker onLoaded={handleAssetsLoaded} onProgress={handleProgress} />
          {!isDay && (
            <>
              <MemoizedStars />
              <MemoizedShootingStars />
              <MemoizedReflectedStars />
            </>
          )}

          {/* シーンの背景と霧 */}
          <color attach="background" args={[backgroundColor]} />
          <fog attach="fog" args={[backgroundColor, 10, isDay ? 60 : 40]} />

          {/* ライティング */}
          <SceneLights
            directionalLightRef={directionalLightRef}
            ambientLightRef={ambientLightRef}
            pointLightRef={pointLightRef}
            spotLightRef={spotLightRef}
          />
          <LightingController
            directionalLightRef={directionalLightRef}
            ambientLightRef={ambientLightRef}
            pointLightRef={pointLightRef}
            spotLightRef={spotLightRef}
          />

          {/* 太陽 */}
          <Sun />
          {/* カメラコントロール */}
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={1}
            dampingFactor={0.1}
            enableDamping={true}
          />

          {/* 初期表示の核になる軽量オブジェクト */}
          <MemoizedGround />
          <MemoizedWaterSurface onInteract={uxHints.markWaterRippled} />
          <MemoizedSundialGnomon />
          <MemoizedSundialBase />

          {/* モデル・装飾系は初期描画をブロックしない */}
          <Suspense fallback={null}>
            <MemoizedFishManager />
          </Suspense>
          <Suspense fallback={null}>
            <WaterPlantsLarge />
            <PottedPlant />
            <Rocks />
            <BubbleEffect />
          </Suspense>
          <Suspense fallback={null}>
            <MemoizedDriftingBottle
              position={[-3, 8.2, 2]}
              onMessageRead={uxHints.markBottleOpened}
              showHint={!isLoading && uxHints.shouldShowBottleHint}
              windDirection={windDirection}
              weather={weather}
            />
          </Suspense>
          <Suspense fallback={null}>
            <MemoizedParticleLayerInstanced />
            <MemoizedClouds timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60} />
          </Suspense>

          {/* 季節エフェクト */}
          <Suspense fallback={null}>
            <MemoizedSeasonalEffects weather={weather} />
          </Suspense>

          {/* デバッグヘルパー - 削除 */}
          {/* <DebugHelpers enabled={DEBUG_MODE} /> */}
          {/* パフォーマンスモニター - データ収集（Canvas内） */}
          {PERFORMANCE_MONITOR && <PerformanceMonitorCollector />}
        </Canvas>
        {/* パフォーマンスモニター - 表示（Canvas外） - ローディング完了後のみ表示 */}
        {PERFORMANCE_MONITOR && !isLoading && <PerformanceMonitorDisplay enabled={PERFORMANCE_MONITOR} />}
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
