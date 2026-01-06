import React, { Suspense, useRef, useMemo, memo, useState, useEffect } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
import { TimeProvider, useTime } from "./contexts/TimeContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
import { DebugHelpers } from "./components/DebugHelpers";
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

const DEBUG_MODE = false; // デバッグヘルパーの表示切替
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
 * アプリケーション内部コンポーネント
 * TimeProviderの中で時間情報を使用
 */
const AppContent = () => {
  const { isDay, realTime } = useTime();
  const windDirection = useWindDirection();
  const [isLoading, setIsLoading] = useState(true);
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

  // 最低表示時間後にローディングを非表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2秒間表示
    return () => clearTimeout(timer);
  }, []);

  return (
      <div
        className="App"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          margin: 0,
          border: "none",
          backgroundColor, // 昼と夜の背景の切り替え、夜を明るく
          overflow: "hidden",
          transition: "background-color 2s ease", // 背景色のスムーズな切り替え
        }}
      >
        {isLoading && <Loader />}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
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

            {/* デバッグヘルパー */}
            <DebugHelpers enabled={DEBUG_MODE} />
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
