import React, { useRef, useMemo, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useSeason } from "../contexts";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import {
  getRainIntensity,
  getWaterReflectionIntensity,
  getWeatherWaterTurbulence,
  type WeatherSnapshot,
} from "@/utils/weather";
import {
  WATER_SURFACE_Y,
  WATER_SURFACE_Y_AMPLITUDE,
  WATER_SURFACE_Y_FREQUENCY,
  WATER_SURFACE_SCALE_X,
  WATER_SURFACE_SCALE_Y,
  WATER_SURFACE_SCALE_Z,
  WATER_SURFACE_SEGMENTS,
  WATER_WAVE_FREQUENCY,
  WATER_WAVE_TIME_SCALE,
  WATER_WAVE_AMPLITUDE,
  WATER_RIPPLE_MAX_COUNT,
  WATER_RIPPLE_LIFETIME,
  WATER_RIPPLE_SPEED,
  WATER_RIPPLE_WAVELENGTH,
  WATER_RIPPLE_AMPLITUDE,
  WATER_RIPPLE_DECAY,
  WATER_RIPPLE_TIME_DECAY,
  WATER_COLOR,
  WATER_OPACITY,
  WATER_METALNESS,
  WATER_ROUGHNESS,
  WATER_ENV_MAP_INTENSITY,
} from "../constants/waterSurface";
import {
  createPetalGeometry,
  DROPLET_LIFETIME,
  getRipplePalette,
  getRippleTuning,
  pseudoRandom,
  type DropletParticle,
  type RipplePoint,
} from "./waterSurfaceEffects";
import { WaterDroplets } from "./WaterDroplets";
import { WaterRipples } from "./WaterRipples";

/**
 * 水面コンポーネント
 * 波紋アニメーションと光の反射を持つ透明な水面を表示
 */
interface WaterSurfaceProps {
  onInteract?: () => void;
  weather: WeatherSnapshot;
}

const WaterSurface: React.FC<WaterSurfaceProps> = ({ onInteract, weather }) => {
  const { season } = useSeason();
  const meshRef = useRef<THREE.Mesh | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const ripplesRef = useRef<RipplePoint[]>([]);
  const dropletsRef = useRef<DropletParticle[]>([]);
  const elapsedTimeRef = useRef(0);
  const nextRippleIdRef = useRef(0);
  const nextDropletIdRef = useRef(0);
  const nextWeatherRippleAtRef = useRef(0);
  const weatherRipplePointRef = useRef(new THREE.Vector3());
  const normalUpdateCountRef = useRef(0);
  const [, setRenderTick] = useState(0);
  const rainIntensity = getRainIntensity(weather);
  const reflectionIntensity = getWaterReflectionIntensity(weather);
  const waterTurbulence = getWeatherWaterTurbulence(weather);
  const waterBaseColor = useMemo(() => new THREE.Color(WATER_COLOR), []);
  const waterStormColor = useMemo(() => new THREE.Color("#16334d"), []);

  // マテリアルをメモ化してパフォーマンス向上
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATER_COLOR,
        transparent: true,
        opacity: WATER_OPACITY,
        side: THREE.DoubleSide,
        metalness: WATER_METALNESS,
        roughness: WATER_ROUGHNESS,
        envMapIntensity: WATER_ENV_MAP_INTENSITY,
      }),
    []
  );

  const petalGeometry = useMemo(() => createPetalGeometry(), []);
  const rippleRingGeometry = useMemo(() => new THREE.RingGeometry(0.99, 1, 56), []);
  const sparkleGeometry = useMemo(() => new THREE.CircleGeometry(1, 14), []);
  const dropletGeometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);

  useEffect(() => {
    return () => {
      material.dispose();
      petalGeometry.dispose();
      rippleRingGeometry.dispose();
      sparkleGeometry.dispose();
      dropletGeometry.dispose();
    };
  }, [
    dropletGeometry,
    material,
    petalGeometry,
    rippleRingGeometry,
    sparkleGeometry,
  ]);

  const ripplePalette = useMemo(() => getRipplePalette(season), [season]);
  const rippleTuning = useMemo(() => getRippleTuning(season), [season]);

  const addRipple = useCallback((
    rippleX: number,
    rippleY: number,
    worldPoint: THREE.Vector3,
    notifyInteraction = true
  ) => {
    const ripplePoint = {
      id: nextRippleIdRef.current++,
      x: rippleX,
      y: rippleY,
      worldX: worldPoint.x,
      worldY: worldPoint.y,
      worldZ: worldPoint.z,
      startTime: elapsedTimeRef.current,
    } satisfies RipplePoint;

    ripplesRef.current = [...ripplesRef.current.slice(-(WATER_RIPPLE_MAX_COUNT - 1)), ripplePoint];

    const dropletParticles = Array.from({ length: rippleTuning.dropletCount }, (_, index) => {
      const angle = (Math.PI * 2 * index) / rippleTuning.dropletCount + Math.random() * 0.35;
      const speed = (0.08 + Math.random() * 0.08) * rippleTuning.dropletSpread;
      return {
        id: nextDropletIdRef.current++,
        worldX: worldPoint.x,
        worldY: worldPoint.y + 0.05,
        worldZ: worldPoint.z,
        velocityX: Math.cos(angle) * speed,
        velocityY: (0.14 + Math.random() * 0.08) * rippleTuning.dropletLift,
        velocityZ: Math.sin(angle) * speed,
        size: 0.035 + Math.random() * 0.02,
        petalLike: Math.random() < rippleTuning.petalChance,
        petalRotation: Math.random() * Math.PI,
        petalSpin: (Math.random() * 1.6 + 0.8) * (Math.random() > 0.5 ? 1 : -1),
        startTime: elapsedTimeRef.current,
      } satisfies DropletParticle;
    });

    dropletsRef.current = [...dropletsRef.current, ...dropletParticles].slice(-24);
    setRenderTick((tick) => tick + 1);
    if (notifyInteraction) {
      onInteract?.();
    }
  }, [
    onInteract,
    rippleTuning.dropletCount,
    rippleTuning.dropletLift,
    rippleTuning.dropletSpread,
    rippleTuning.petalChance,
  ]);

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!meshRef.current) {
      return;
    }

    event.stopPropagation();

    const localPoint = meshRef.current.worldToLocal(event.point.clone());
    addRipple(
      localPoint.x * WATER_SURFACE_SCALE_X,
      localPoint.y * WATER_SURFACE_SCALE_Y,
      event.point
    );
  }, [addRipple]);

  useThrottledFrame((state) => {
    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    if (!mesh || !geometry) return;

    const time = state.clock.getElapsedTime();
    elapsedTimeRef.current = time;
    const weatherDarkening = THREE.MathUtils.clamp(
      rainIntensity * 0.52 + (1 - reflectionIntensity) * 0.24,
      0,
      0.58
    );
    material.color.lerpColors(waterBaseColor, waterStormColor, weatherDarkening);
    material.roughness = THREE.MathUtils.clamp(
      WATER_ROUGHNESS + (1 - reflectionIntensity) * 0.48 + rainIntensity * 0.16,
      0.16,
      0.78
    );
    material.envMapIntensity = WATER_ENV_MAP_INTENSITY * (0.48 + reflectionIntensity * 0.42);
    material.opacity = THREE.MathUtils.clamp(
      WATER_OPACITY + rainIntensity * 0.08,
      0.22,
      0.42
    );

    if (rainIntensity > 0.05 && time >= nextWeatherRippleAtRef.current) {
      const seed = nextRippleIdRef.current * 31 + Math.floor(time * 7);
      const rippleX = (pseudoRandom(seed) - 0.5) * 30;
      const rippleY = (pseudoRandom(seed + 1) - 0.5) * 30;
      weatherRipplePointRef.current.set(rippleX, WATER_SURFACE_Y + 0.04, rippleY);
      addRipple(
        rippleX,
        rippleY,
        weatherRipplePointRef.current,
        false
      );
      nextWeatherRippleAtRef.current = time + Math.max(0.18, 1.05 - rainIntensity * 0.72);
    }

    const nextRipples = ripplesRef.current.filter(
      (ripple) => time - ripple.startTime < WATER_RIPPLE_LIFETIME
    );
    const nextDroplets = dropletsRef.current.filter(
      (droplet) => time - droplet.startTime < DROPLET_LIFETIME
    );
    const hadRippleChange = nextRipples.length !== ripplesRef.current.length;
    const hadDropletChange = nextDroplets.length !== dropletsRef.current.length;
    ripplesRef.current = nextRipples;
    dropletsRef.current = nextDroplets;

    mesh.position.y =
      WATER_SURFACE_Y + Math.sin(time * WATER_SURFACE_Y_FREQUENCY) * WATER_SURFACE_Y_AMPLITUDE;

    const positions = geometry.attributes.position.array;
    if (!(positions instanceof Float32Array)) {
      return;
    }
    const width = WATER_SURFACE_SCALE_X;
    const height = WATER_SURFACE_SCALE_Y;
    const segments = WATER_SURFACE_SEGMENTS;
    const timeScale = time * WATER_WAVE_TIME_SCALE * (0.92 + waterTurbulence * 0.08);

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * width;
      const sinX = Math.sin(x * WATER_WAVE_FREQUENCY + timeScale);

      for (let j = 0; j <= segments; j++) {
        const index = (i * (segments + 1) + j) * 3 + 2;
        const y = (j / segments - 0.5) * height;

        let rippleOffset = 0;
        for (const ripple of ripplesRef.current) {
          const age = time - ripple.startTime;
          if (age < 0 || age > WATER_RIPPLE_LIFETIME) {
            continue;
          }

          const distance = Math.hypot(x - ripple.x, y - ripple.y);
          const waveFront = distance - age * WATER_RIPPLE_SPEED;
          const spatialDecay = Math.exp(-distance * WATER_RIPPLE_DECAY);
          const timeDecay = Math.exp(-age * WATER_RIPPLE_TIME_DECAY);
          const oscillation = Math.sin(waveFront * WATER_RIPPLE_WAVELENGTH);
          rippleOffset += oscillation * spatialDecay * timeDecay * WATER_RIPPLE_AMPLITUDE;
        }

        positions[index] =
          sinX *
            Math.cos(y * WATER_WAVE_FREQUENCY + timeScale) *
            WATER_WAVE_AMPLITUDE *
            waterTurbulence +
          rippleOffset;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    normalUpdateCountRef.current += 1;
    if (normalUpdateCountRef.current % 2 === 0) {
      geometry.computeVertexNormals();
    }

    if (ripplesRef.current.length > 0 || dropletsRef.current.length > 0 || hadRippleChange || hadDropletChange) {
      setRenderTick((tick) => tick + 1);
    }
  }, 30);

  return (
    <>
      <mesh
        ref={meshRef}
      position={[0, WATER_SURFACE_Y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[WATER_SURFACE_SCALE_X, WATER_SURFACE_SCALE_Y, WATER_SURFACE_SCALE_Z]}
      receiveShadow={true}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry ref={geometryRef} args={[1, 1, WATER_SURFACE_SEGMENTS, WATER_SURFACE_SEGMENTS]} />
      <primitive object={material} attach="material" />
    </mesh>

      <WaterRipples
        ripples={ripplesRef.current}
        elapsedTime={elapsedTimeRef.current}
        ripplePalette={ripplePalette}
        rippleTuning={rippleTuning}
        rippleRingGeometry={rippleRingGeometry}
        sparkleGeometry={sparkleGeometry}
      />

      <WaterDroplets
        droplets={dropletsRef.current}
        elapsedTime={elapsedTimeRef.current}
        ripplePalette={ripplePalette}
        petalGeometry={petalGeometry}
        dropletGeometry={dropletGeometry}
      />
    </>
  );
};

export default React.memo(WaterSurface);
