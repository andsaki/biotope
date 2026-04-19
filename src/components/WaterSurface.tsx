import React, { useRef, useMemo, useCallback, useEffect, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
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
  startTime: number;
}

const DROPLET_COUNT = 5;
const DROPLET_LIFETIME = 0.9;
const DROPLET_GRAVITY = 2.6;

/**
 * 水面コンポーネント
 * 波紋アニメーションと光の反射を持つ透明な水面を表示
 */
interface WaterSurfaceProps {
  onInteract?: () => void;
}

const WaterSurface: React.FC<WaterSurfaceProps> = ({ onInteract }) => {
  const { camera, gl } = useThree();
  const { season } = useSeason();
  const meshRef = useRef<THREE.Mesh>(null!);
  const hitPlaneRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.PlaneGeometry>(null!);
  const ripplesRef = useRef<RipplePoint[]>([]);
  const dropletsRef = useRef<DropletParticle[]>([]);
  const elapsedTimeRef = useRef(0);
  const nextRippleIdRef = useRef(0);
  const nextDropletIdRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const localPointRef = useRef(new THREE.Vector3());
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

  const ripplePalette = useMemo(() => {
    switch (season) {
      case "spring":
        return {
          ring: "#ffd8f0",
          secondaryRing: "#ffc2e0",
          glow: "#fff1fb",
        };
      case "summer":
        return {
          ring: "#b8f1ff",
          secondaryRing: "#83e3ff",
          glow: "#effcff",
        };
      case "autumn":
        return {
          ring: "#ffd5a3",
          secondaryRing: "#ffbf80",
          glow: "#fff2dc",
        };
      case "winter":
        return {
          ring: "#dcecff",
          secondaryRing: "#bdd8ff",
          glow: "#f6fbff",
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

    const dropletParticles = Array.from({ length: DROPLET_COUNT }, (_, index) => {
      const angle = (Math.PI * 2 * index) / DROPLET_COUNT + Math.random() * 0.35;
      const speed = 0.08 + Math.random() * 0.08;
      return {
        id: nextDropletIdRef.current++,
        worldX: worldPoint.x,
        worldY: worldPoint.y + 0.05,
        worldZ: worldPoint.z,
        velocityX: Math.cos(angle) * speed,
        velocityY: 0.14 + Math.random() * 0.08,
        velocityZ: Math.sin(angle) * speed,
        size: 0.035 + Math.random() * 0.02,
        startTime: elapsedTimeRef.current,
      } satisfies DropletParticle;
    });

    dropletsRef.current = [...dropletsRef.current, ...dropletParticles].slice(-24);
    setRenderTick((tick) => tick + 1);
    onInteract?.();
  }, [onInteract]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerDown = (event: PointerEvent) => {
      if (!meshRef.current || !hitPlaneRef.current) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);

      const [waterIntersection] = raycasterRef.current.intersectObject(hitPlaneRef.current, false);

      if (!waterIntersection) {
        return;
      }

      const localPoint = meshRef.current.worldToLocal(
        localPointRef.current.copy(waterIntersection.point)
      );

      addRipple(
        localPoint.x * WATER_SURFACE_SCALE_X,
        localPoint.y * WATER_SURFACE_SCALE_Y,
        waterIntersection.point
      );
    };

    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [addRipple, camera, gl]);

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
      >
        <planeGeometry ref={geometryRef} args={[1, 1, WATER_SURFACE_SEGMENTS, WATER_SURFACE_SEGMENTS]} />
        <primitive object={material} attach="material" />
      </mesh>

      <mesh
        ref={hitPlaneRef}
        position={[0, WATER_SURFACE_Y + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[WATER_SURFACE_SCALE_X, WATER_SURFACE_SCALE_Y, WATER_SURFACE_SCALE_Z]}
      >
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial transparent={true} opacity={0} depthWrite={false} />
      </mesh>

      {ripplesRef.current.map((ripple) => {
        const age = elapsedTimeRef.current - ripple.startTime;
        const progress = Math.min(1, Math.max(0, age / WATER_RIPPLE_LIFETIME));
        const outerRadius = 0.6 + progress * 3.4;
        const innerRadius = 0.42 + progress * 2.25;
        const sparkleOrbitRadius = 0.38 + progress * 2.9;
        const outerOpacity = Math.max(0, (1 - progress) * 0.34);
        const innerOpacity = Math.max(0, (1 - progress) * 0.18);
        const sparkleOpacity = Math.max(0, (1 - progress) * 0.6);
        const sparkleScale = 0.035 + (1 - progress) * 0.03;
        const sparklePhase = progress * Math.PI * 1.4 + ripple.id * 0.37;

        return (
          <group key={ripple.id} position={[ripple.worldX, ripple.worldY + 0.05, ripple.worldZ]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[outerRadius, outerRadius, 1]} renderOrder={999}>
              <ringGeometry args={[0.93, 1, 72]} />
              <meshBasicMaterial
                color={ripplePalette.ring}
                transparent={true}
                opacity={outerOpacity}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[innerRadius, innerRadius, 1]} renderOrder={1000}>
              <ringGeometry args={[0.955, 1, 72]} />
              <meshBasicMaterial
                color={ripplePalette.secondaryRing}
                transparent={true}
                opacity={innerOpacity}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {Array.from({ length: 6 }, (_, index) => {
              const angle = sparklePhase + (Math.PI * 2 * index) / 6;
              const sparkleRadius = sparkleOrbitRadius + (index % 2 === 0 ? 0.08 : -0.05);
              return (
                <mesh
                  key={`${ripple.id}-sparkle-${index}`}
                  position={[
                    Math.cos(angle) * sparkleRadius,
                    0.01,
                    Math.sin(angle) * sparkleRadius,
                  ]}
                  renderOrder={1001}
                >
                  <sphereGeometry args={[sparkleScale, 10, 10]} />
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
        const x = droplet.worldX + droplet.velocityX * age * 7;
        const y =
          droplet.worldY +
          droplet.velocityY * age * 4 -
          0.5 * DROPLET_GRAVITY * age * age;
        const z = droplet.worldZ + droplet.velocityZ * age * 7;
        const opacity = Math.max(0, (1 - progress) * 0.72);
        const scale = droplet.size * (1 - progress * 0.35);

        return (
          <group key={droplet.id} position={[x, y, z]} renderOrder={1002}>
            <mesh>
              <sphereGeometry args={[scale, 10, 10]} />
              <meshBasicMaterial
                color={ripplePalette.glow}
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
