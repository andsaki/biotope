import React, { Suspense, useRef, useMemo, memo, useState, useEffect, useCallback } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
import { TimeProvider, useTime } from "./contexts/TimeContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayerInstanced from "./components/ParticleLayerInstanced";
import Clouds from "./components/Clouds";
import WindDirectionDisplay from "./components/WindDirectionDisplay";
import Ground from "./components/Ground";
import Stars from "./components/Stars";
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
import { SIMULATED_SECONDS_PER_REAL_SECOND } from "./constants";
import { useWindDirection } from "./hooks/useWindDirection";
import { calculateSunPosition } from "./utils/sunPosition";

// 3Dモデルのpreload
import { preloadModel } from "./hooks/useModelScene";

preloadModel("normalFish");
preloadModel("flatfish");
preloadModel("leaf");

// const DEBUG_MODE = false; // デバッグヘルパーの表示切替 - 削除
const PERFORMANCE_MONITOR = import.meta.env.DEV; // 開発モードで自動的に有効化

// メモ化されたコンポーネント
const MemoizedGround = memo(Ground);
const MemoizedFishManager = memo(FishManager);
const MemoizedParticleLayerInstanced = memo(ParticleLayerInstanced);
const MemoizedClouds = memo(Clouds);
const MemoizedStars = memo(Stars);
const MemoizedReflectedStars = memo(ReflectedStars);
const MemoizedWaterSurface = memo(WaterSurface);
// SundialGnomonはsunPositionを受け取るのでメモ化の条件を調整
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

const MINIMUM_LOADER_MS = 2000;
type AppStyle = React.CSSProperties & { "--app-background-color"?: string };

/**
 * アプリケーション内部コンポーネント
 * TimeProviderの中で時間情報を使用
 */
const AppContent = () => {
  const { isDay, realTime } = useTime();
  const windDirection = useWindDirection();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("初期化中...");
  const isLoading = !(assetsLoaded && minDelayElapsed);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

  // 太陽の位置を計算
  const sunPosition = useMemo(
    () => calculateSunPosition(realTime.hours, realTime.minutes),
    [realTime.hours, realTime.minutes]
  );

  // 背景色をメモ化
  const backgroundColor = useMemo(() => isDay ? "#4A90E2" : "#2A2A4E", [isDay]);

  // 最低表示時間を確保
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayElapsed(true);
    }, MINIMUM_LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleAssetsLoaded = useCallback(() => {
    setAssetsLoaded(true);
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
        {isLoading && <Loader progress={loadingProgress} loadingText={loadingText} />}
        <Canvas
          className="App-canvas"
          camera={{ position: [5, 3, 0], fov: 70 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance", // 高性能GPUを優先
            alpha: false, // 透明な背景が不要な場合はfalse
            stencil: false, // ステンシルバッファを無効化してパフォーマンス向上
          }}
          dpr={[1, 2]} // デバイスピクセル比を制限してパフォーマンス向上
          frameloop="always" // 常にレンダリング
          performance={{ min: 0.5 }} // パフォーマンス低下時の最小品質
        >
          {/* Three.jsローダーの完了を検知 */}
          <LoadingTracker onLoaded={handleAssetsLoaded} onProgress={handleProgress} />
          <Suspense fallback={null}>
            <MemoizedStars />
            <MemoizedReflectedStars />

            {/* シーンの背景と霧 */}
            <color attach="background" args={[backgroundColor]} />
            <fog attach="fog" args={[backgroundColor, 10, isDay ? 60 : 40]} />

            {/* ライティング */}
            <SceneLights
              sunPosition={sunPosition}
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
            <Sun position={sunPosition} />
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

            {/* 環境オブジェクト */}
            <MemoizedGround />
            <MemoizedFishManager />
            <WaterPlantsLarge />
            <PottedPlant />
            <Rocks />
            <BubbleEffect />
            <MemoizedWaterSurface />
            <MemoizedSundialGnomon sunPosition={sunPosition} />
            <MemoizedSundialBase />
            <MemoizedDriftingBottle position={[-3, 8.2, 2]} />
            <MemoizedParticleLayerInstanced />
            <MemoizedClouds timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60} />

            {/* 季節エフェクト */}
            <MemoizedSeasonalEffects />

            {/* デバッグヘルパー - 削除 */}
            {/* <DebugHelpers enabled={DEBUG_MODE} /> */}
          </Suspense>
          {/* パフォーマンスモニター - データ収集（Canvas内） */}
          {PERFORMANCE_MONITOR && <PerformanceMonitorCollector />}
        </Canvas>
        {/* パフォーマンスモニター - 表示（Canvas外） */}
        {PERFORMANCE_MONITOR && <PerformanceMonitorDisplay enabled={PERFORMANCE_MONITOR} />}
        <UI />
        <MemoizedWindDirectionDisplay windDirection={windDirection} />
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
