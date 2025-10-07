import React, { Suspense, useRef, useMemo } from "react";

import { SeasonProvider } from "./contexts/SeasonContext";
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
import { useRealTime } from "./hooks/useRealTime";
import { useWindDirection } from "./hooks/useWindDirection";
import { useLoader } from "./hooks/useLoader";
import { calculateSunPosition } from "./utils/sunPosition";

const DEBUG_MODE = false; // デバッグヘルパーの表示切替

function App() {
  const { isDay, realTime } = useRealTime();
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
    <SeasonProvider>
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
            <Stars isNight={!isDay} />
            <ReflectedStars isNight={!isDay} />

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
              isDay={isDay}
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
            <Ground />
            <FishManager />
            <WaterPlantsLarge />
            <PottedPlant />
            <Rocks />
            <BubbleEffect />
            <WaterSurface />
            <SundialGnomon />
            <SundialBase />
            <DriftingBottle position={[-3, 8.2, 2]} />
            <ParticleLayer />
            <Clouds timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60} />

            {/* 季節エフェクト */}
            <SeasonalEffects />

            {/* デバッグヘルパー */}
            <DebugHelpers enabled={DEBUG_MODE} />
          </Suspense>
        </Canvas>
        <UI realTime={realTime} isDay={isDay} />
        <WindDirectionDisplay windDirection={windDirection} />
      </div>
    </SeasonProvider>
  );
}


export default App;
