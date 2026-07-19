import React, { Suspense, memo, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import * as THREE from "three";
import FishManager from "./FishManager";
import ParticleLayerInstanced from "./ParticleLayerInstanced";
import Clouds from "./Clouds";
import WeatherAtmosphere from "./WeatherAtmosphere";
import Ground from "./Ground";
import Stars from "./Stars";
import ShootingStars from "./ShootingStars";
import ReflectedStars from "./ReflectedStars";
import WaterSurface from "./WaterSurface";
import LightingController from "./LightingController";
import SundialGnomon from "./SundialGnomon";
import SundialBase from "./SundialBase";
import { DriftingBottle } from "./DriftingBottle";
import { Sun } from "./Sun";
import { SceneLights } from "./SceneLights";
import { SeasonalEffects } from "./SeasonalEffects";
import { PerformanceMonitorCollector } from "./PerformanceMonitor";
import { SIMULATED_SECONDS_PER_REAL_SECOND } from "@/constants/core";
import { preloadModel } from "@/hooks/useModelScene";
import type { WindDirection } from "@/utils/bottleJournal";
import type { WeatherSnapshot } from "@/utils/weather";

const PRELOADED_MODEL_KEYS = ["flatfish", "leaf", "lily", "pottedPlant", "frog"] as const;
PRELOADED_MODEL_KEYS.forEach(preloadModel);

const WaterPlantsLarge = React.lazy(() => import("./WaterPlantsLarge"));
const PottedPlant = React.lazy(() => import("./PottedPlant"));
const Rocks = React.lazy(() => import("./Rocks"));
const BubbleEffect = React.lazy(() => import("./BubbleEffect"));

const MemoizedGround = memo(Ground);
const MemoizedFishManager = memo(FishManager);
const MemoizedParticleLayerInstanced = memo(ParticleLayerInstanced);
const MemoizedClouds = memo(Clouds);
const MemoizedStars = memo(Stars);
const MemoizedShootingStars = memo(ShootingStars);
const MemoizedReflectedStars = memo(ReflectedStars);
const MemoizedWaterSurface = memo(WaterSurface);
const MemoizedSundialGnomon = memo(SundialGnomon);
const MemoizedSundialBase = memo(SundialBase);
const MemoizedDriftingBottle = memo(DriftingBottle);
const MemoizedSeasonalEffects = memo(SeasonalEffects);

interface LoadingTrackerProps {
  onLoaded: () => void;
  onProgress: (progress: number, loadingText: string) => void;
}

/**
 * Canvas内でThree.jsの読み込み状況を監視し、完了時に親へ通知
 */
const LoadingTracker = ({ onLoaded, onProgress }: LoadingTrackerProps) => {
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

interface SceneCanvasProps {
  backgroundColor: string;
  isDay: boolean;
  isLoading: boolean;
  isMobile: boolean;
  performanceMonitorEnabled: boolean;
  showBottleHint: boolean;
  weather: WeatherSnapshot;
  windDirection: WindDirection;
  waterSignal: number;
  onAssetsLoaded: () => void;
  onBottleMessageRead: () => void;
  onProgress: (progress: number, loadingText: string) => void;
  onWaterInteract: () => void;
}

const SceneCanvas = ({
  backgroundColor,
  isDay,
  isLoading,
  isMobile,
  performanceMonitorEnabled,
  showBottleHint,
  weather,
  windDirection,
  waterSignal,
  onAssetsLoaded,
  onBottleMessageRead,
  onProgress,
  onWaterInteract,
}: SceneCanvasProps) => {
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const spotLightRef = useRef<THREE.SpotLight | null>(null);

  const cameraConfig = useMemo<{ position: [number, number, number]; fov: number }>(
    () => ({
      position: [5, 3, 0],
      fov: isMobile ? 75 : 70,
    }),
    [isMobile]
  );
  const rendererConfig = useMemo<THREE.WebGLRendererParameters>(
    () => ({
      antialias: !isMobile,
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
    }),
    [isMobile]
  );
  const canvasDpr = useMemo<[number, number]>(
    () => (isMobile ? [0.75, 1.25] : [1, 1.75]),
    [isMobile]
  );

  return (
    <Canvas
      className="App-canvas"
      camera={cameraConfig}
      gl={rendererConfig}
      dpr={canvasDpr}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <LoadingTracker onLoaded={onAssetsLoaded} onProgress={onProgress} />
      {!isDay && (
        <>
          <MemoizedStars />
          <MemoizedShootingStars />
          <MemoizedReflectedStars />
        </>
      )}

      <color attach="background" args={[backgroundColor]} />
      <WeatherAtmosphere
        backgroundColor={backgroundColor}
        isDay={isDay}
        weather={weather}
      />

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
        weather={weather}
      />

      <Sun />
      <OrbitControls
        enableZoom
        enablePan
        enableRotate
        maxDistance={20}
        minDistance={1}
        dampingFactor={0.1}
        enableDamping
      />

      <MemoizedGround />
      <MemoizedWaterSurface weather={weather} onInteract={onWaterInteract} />
      <MemoizedSundialGnomon />
      <MemoizedSundialBase />

      <Suspense fallback={null}>
        <MemoizedFishManager weather={weather} waterSignal={waterSignal} isDay={isDay} />
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
          onMessageRead={onBottleMessageRead}
          showHint={!isLoading && showBottleHint}
          windDirection={windDirection}
          weather={weather}
        />
      </Suspense>
      <Suspense fallback={null}>
        <MemoizedParticleLayerInstanced />
        <MemoizedClouds
          weather={weather}
          timeScale={SIMULATED_SECONDS_PER_REAL_SECOND / 60}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MemoizedSeasonalEffects weather={weather} />
      </Suspense>

      {performanceMonitorEnabled && <PerformanceMonitorCollector />}
    </Canvas>
  );
};

export default memo(SceneCanvas);
