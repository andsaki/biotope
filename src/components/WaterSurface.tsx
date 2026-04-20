import React, { useRef, useMemo, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useSeason } from "../contexts";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
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

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const createPetalGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1);
  shape.bezierCurveTo(0.58, 0.86, 0.84, 0.22, 0.34, -0.26);
  shape.quadraticCurveTo(0.12, -0.44, 0, -0.92);
  shape.quadraticCurveTo(-0.12, -0.44, -0.34, -0.26);
  shape.bezierCurveTo(-0.84, 0.22, -0.58, 0.86, 0, 1);

  const geometry = new THREE.ShapeGeometry(shape, 24);
  geometry.center();
  return geometry;
};

interface RipplePoint {
  id: number;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  startTime: number;
}

interface DropletParticle {
  id: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  size: number;
  petalLike: boolean;
  petalRotation: number;
  petalSpin: number;
  startTime: number;
}

const DROPLET_LIFETIME = 0.9;
const DROPLET_GRAVITY = 2.6;
const RIPPLE_SPARKLE_INDICES = [0, 1, 2, 3, 4] as const;

/**
 * 水面コンポーネント
 * 波紋アニメーションと光の反射を持つ透明な水面を表示
 */
interface WaterSurfaceProps {
  onInteract?: () => void;
}

const WaterSurface: React.FC<WaterSurfaceProps> = ({ onInteract }) => {
  const { season } = useSeason();
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.PlaneGeometry>(null!);
  const ripplesRef = useRef<RipplePoint[]>([]);
  const dropletsRef = useRef<DropletParticle[]>([]);
  const elapsedTimeRef = useRef(0);
  const nextRippleIdRef = useRef(0);
  const nextDropletIdRef = useRef(0);
  const [, setRenderTick] = useState(0);

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
  const rippleRingGeometry = useMemo(() => new THREE.RingGeometry(0.978, 1, 80), []);
  const sparkleGeometry = useMemo(() => new THREE.CircleGeometry(1, 14), []);
  const dropletGeometry = useMemo(() => new THREE.SphereGeometry(1, 10, 10), []);

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

  const ripplePalette = useMemo(() => {
    switch (season) {
      case "spring":
        return {
          ring: "#ffd8f0",
          glow: "#fff1fb",
        };
      case "summer":
        return {
          ring: "#b8f1ff",
          glow: "#effcff",
        };
      case "autumn":
        return {
          ring: "#ffd5a3",
          glow: "#fff2dc",
        };
      case "winter":
        return {
          ring: "#dcecff",
          glow: "#f6fbff",
        };
    }
  }, [season]);

  const rippleTuning = useMemo(() => {
    switch (season) {
      case "spring":
        return {
          dropletCount: 4,
          dropletLift: 0.92,
          dropletSpread: 0.9,
          ringOpacity: 0.16,
          sparkleOpacity: 0.4,
          petalChance: 0.92,
        };
      case "summer":
        return {
          dropletCount: 6,
          dropletLift: 1.12,
          dropletSpread: 1.08,
          ringOpacity: 0.2,
          sparkleOpacity: 0.48,
          petalChance: 0,
        };
      case "autumn":
        return {
          dropletCount: 4,
          dropletLift: 0.88,
          dropletSpread: 0.86,
          ringOpacity: 0.15,
          sparkleOpacity: 0.34,
          petalChance: 0,
        };
      case "winter":
        return {
          dropletCount: 3,
          dropletLift: 0.78,
          dropletSpread: 0.72,
          ringOpacity: 0.13,
          sparkleOpacity: 0.28,
          petalChance: 0,
        };
    }
  }, [season]);

  const addRipple = useCallback((
    rippleX: number,
    rippleY: number,
    worldPoint: THREE.Vector3
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
    onInteract?.();
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
    if (!meshRef.current || !geometryRef.current) return;

    const time = state.clock.getElapsedTime();
    elapsedTimeRef.current = time;
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

    meshRef.current.position.y =
      WATER_SURFACE_Y + Math.sin(time * WATER_SURFACE_Y_FREQUENCY) * WATER_SURFACE_Y_AMPLITUDE;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const width = WATER_SURFACE_SCALE_X;
    const height = WATER_SURFACE_SCALE_Y;
    const segments = WATER_SURFACE_SEGMENTS;
    const timeScale = time * WATER_WAVE_TIME_SCALE;

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
          sinX * Math.cos(y * WATER_WAVE_FREQUENCY + timeScale) * WATER_WAVE_AMPLITUDE +
          rippleOffset;
      }
    }

    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
    geometryRef.current.computeBoundingSphere();

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

      {ripplesRef.current.map((ripple) => {
        const age = elapsedTimeRef.current - ripple.startTime;
        const progress = Math.min(1, Math.max(0, age / WATER_RIPPLE_LIFETIME));
        const mainRadius = 0.72 + progress * 3.15;
        const mainOpacity = Math.max(0, (1 - progress) * rippleTuning.ringOpacity);
        const impactOpacity = Math.max(0, (1 - progress * 1.9) * rippleTuning.sparkleOpacity * 0.85);
        const impactScale = 0.16 + progress * 0.55;
        const trailingProgress = Math.min(1, Math.max(0, (progress - 0.12) / 0.88));
        const trailingRadius = 0.5 + trailingProgress * 2.7;
        const trailingOpacity = Math.max(0, (1 - trailingProgress) * rippleTuning.ringOpacity * 0.55);
        const sparkleOpacity = Math.max(0, (1 - progress) * rippleTuning.sparkleOpacity);
        const sparklePhase = progress * Math.PI * 0.9 + ripple.id * 0.19;

        return (
          <group key={ripple.id} position={[ripple.worldX, ripple.worldY + 0.05, ripple.worldZ]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[impactScale, impactScale, 1]} renderOrder={998}>
              <primitive object={sparkleGeometry} attach="geometry" />
              <meshBasicMaterial
                color={ripplePalette.glow}
                transparent={true}
                opacity={impactOpacity}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[mainRadius, mainRadius, 1]} renderOrder={999}>
              <primitive object={rippleRingGeometry} attach="geometry" />
              <meshBasicMaterial
                color={ripplePalette.ring}
                transparent={true}
                opacity={mainOpacity}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {trailingOpacity > 0 && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                scale={[trailingRadius, trailingRadius, 1]}
                renderOrder={1000}
              >
                <primitive object={rippleRingGeometry} attach="geometry" />
                <meshBasicMaterial
                  color={ripplePalette.glow}
                  transparent={true}
                  opacity={trailingOpacity}
                  depthWrite={false}
                  depthTest={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}

            {RIPPLE_SPARKLE_INDICES.map((index) => {
              const seed = ripple.id * 17 + index * 31;
              const angle = sparklePhase + pseudoRandom(seed) * Math.PI * 2;
              const sparkleRadius = 0.24 + progress * (1.8 + pseudoRandom(seed + 1) * 0.9);
              const sparkleScale = 0.012 + pseudoRandom(seed + 2) * 0.018 + (1 - progress) * 0.008;
              const verticalOffset = (pseudoRandom(seed + 3) - 0.5) * 0.018;
              const dropletRotation = pseudoRandom(seed + 4) * Math.PI;
              return (
                <mesh
                  key={`${ripple.id}-sparkle-${index}`}
                  position={[
                    Math.cos(angle) * sparkleRadius,
                    0.008 + verticalOffset,
                    Math.sin(angle) * sparkleRadius,
                  ]}
                  rotation={[-Math.PI / 2, 0, dropletRotation]}
                  scale={[sparkleScale * 0.7, sparkleScale * 1.35, 1]}
                  renderOrder={1001}
                >
                  <primitive object={sparkleGeometry} attach="geometry" />
                  <meshBasicMaterial
                    color={ripplePalette.glow}
                    transparent={true}
                    opacity={sparkleOpacity}
                    depthWrite={false}
                    depthTest={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {dropletsRef.current.map((droplet) => {
        const age = elapsedTimeRef.current - droplet.startTime;
        const progress = Math.min(1, Math.max(0, age / DROPLET_LIFETIME));
        const lateralDrift = droplet.petalLike ? Math.sin(progress * Math.PI * 2.2 + droplet.id) * 0.08 : 0;
        const x = droplet.worldX + droplet.velocityX * age * 7 + lateralDrift;
        const y =
          droplet.worldY +
          droplet.velocityY * age * 4 -
          0.5 * DROPLET_GRAVITY * age * age;
        const z = droplet.worldZ + droplet.velocityZ * age * 7 + (droplet.petalLike ? lateralDrift * 0.35 : 0);
        const opacity = Math.max(0, (1 - progress) * 0.72);
        const scale = droplet.size * (1 - progress * 0.35);
        const petalWobble = droplet.petalLike ? Math.sin(age * 10 + droplet.id) * 0.18 : 0;

        return (
          <group key={droplet.id} position={[x, y, z]} renderOrder={1002}>
            <mesh
              rotation={
                droplet.petalLike
                  ? [0, age * 1.4 + petalWobble, droplet.petalRotation + age * droplet.petalSpin]
                  : [0, 0, 0]
              }
              scale={droplet.petalLike ? [scale * 0.95, scale * 1.55, 1] : [scale, scale, scale]}
            >
              {droplet.petalLike ? (
                <primitive object={petalGeometry} attach="geometry" />
              ) : (
                <primitive object={dropletGeometry} attach="geometry" />
              )}
              <meshBasicMaterial
                color={droplet.petalLike ? ripplePalette.ring : ripplePalette.glow}
                transparent={true}
                opacity={opacity}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

export default React.memo(WaterSurface);
