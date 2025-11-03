import React, { Suspense, useRef, useMemo, memo } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
import { TimeProvider, useTime } from "./contexts/TimeContext";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./components/FishManager";
import ParticleLayer from "./components/ParticleLayer";
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
import { useLoader } from "./hooks/useLoader";
import { calculateSunPosition } from "./utils/sunPosition";

const DEBUG_MODE = false; // デバッグヘルパーの表示切替

// メモ化されたコンポーネント
const MemoizedGround = memo(Ground);
const MemoizedFishManager = memo(FishManager);
const MemoizedParticleLayer = memo(ParticleLayer);
const MemoizedClouds = memo(Clouds);
const MemoizedStars = memo(Stars);
const MemoizedReflectedStars = memo(ReflectedStars);
const MemoizedWaterSurface = memo(WaterSurface);
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
  const showLoader = useLoader();
  const directionalLightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const pointLightRef = useRef<THREE.PointLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);

  // 太陽の位置を計算
  const sunPosition = useMemo(
    () => calculateSunPosition(realTime.hours, realTime.minutes),
    [realTime.hours, realTime.minutes]
  );

  return (
      <div
        className="App"
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          margin: 0,
          border: "none",
          backgroundColor: isDay ? "#4A90E2" : "#2A2A4E", // 昼と夜の背景の切り替え、夜を明るく
          overflow: "hidden",
          transition: "background-color 2s ease", // 背景色のスムーズな切り替え
        }}
      >
        {showLoader && <Loader />}
        <Canvas
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
          camera={{ position: [5, 3, 0], fov: 70 }}
          gl={{ antialias: true }} // よりスムーズなレンダリングのためにアンチエイリアシングを有効化
        >
          <Suspense fallback={null}>
            <MemoizedStars />
            <MemoizedReflectedStars />

            {/* シーンの背景と霧 */}
            <color attach="background" args={[isDay ? "#4A90E2" : "#2A2A4E"]} />
            <fog attach="fog" args={[isDay ? "#4A90E2" : "#2A2A4E", 10, isDay ? 60 : 40]} />

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
            <MemoizedSundialGnomon />
            <MemoizedSundialBase />
            <MemoizedDriftingBottle position={[-3, 8.2, 2]} />
            <MemoizedParticleLayer />
            <MemoizedClouds timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60} />

            {/* 季節エフェクト */}
            <MemoizedSeasonalEffects />

            {/* デバッグヘルパー */}
            <DebugHelpers enabled={DEBUG_MODE} />
          </Suspense>
        </Canvas>
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
