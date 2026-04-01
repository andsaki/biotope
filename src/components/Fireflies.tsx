import React, { useRef, useMemo, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";
import { createRng, randomBetween } from "../utils/random";
import {
  LILY_DATA,
  WATER_HEIGHT_BASE,
  WATER_HEIGHT_AMPLITUDE,
  WATER_HEIGHT_FREQUENCY,
  LILY_WAVE_FREQUENCY,
  LILY_WAVE_TIME_SCALE,
  LILY_WAVE_AMPLITUDE,
} from "../constants/waterPlants";

// 植木鉢の葉の位置（推定）
const POTTED_PLANT_SPOTS: ReadonlyArray<{ position: [number, number, number] }> = [
  { position: [-6, 0.5, -5] },
];

// ホタルが止まれる全スポット（睡蓮 + 植木鉢）
const RESTING_SPOTS = [
  ...LILY_DATA.map((lily, i) => ({ position: lily.position, type: "lily" as const, index: i })),
  ...POTTED_PLANT_SPOTS.map((plant, i) => ({ position: plant.position, type: "plant" as const, index: i + LILY_DATA.length })),
];

/** ホタルの設定 */
const FIREFLY_COUNT = 12;
const FIREFLY_COLOR = "#CDFF00";
const FIREFLY_SIZE = 0.08;
const RESTING_DURATION_MIN = 3; // 止まる時間（秒）
const RESTING_DURATION_MAX = 6;
const FLYING_DURATION_MIN = 8; // 飛ぶ時間（秒）
const FLYING_DURATION_MAX = 15;
const IDEAL_FRAME_TIME = 1 / 60; // 60fps を基準
const TRAIL_SEGMENTS = 6;
const TRAIL_FADE = 0.7;
const CAMERA_DISTANCE_FALLOFF = 28;
const DISTANCE_BRIGHTNESS_MIN = 0.55;
const DISTANCE_BRIGHTNESS_MAX = 1.35;
const GLOBAL_BREEZE_STRENGTH = 0.0025;
const TRAIL_INSTANCE_COUNT = FIREFLY_COUNT * TRAIL_SEGMENTS;

const SPAWN_AREA = {
  X_MIN: -8,
  X_MAX: 8,
  Y_MIN: 9, // 水面(Y=8)より上
  Y_MAX: 12,
  Z_MIN: -8,
  Z_MAX: 8,
};

const BLINK_PATTERNS = ["single", "double", "breather"] as const;
type BlinkPattern = (typeof BLINK_PATTERNS)[number];

/** ホタルの状態データ */
interface Firefly {
  id: number;
  x: number;
  y: number;
  z: number;
  time: number;
  phase: number;
  phaseSpeed: number;
  isResting: boolean;
  restingTime: number;
  flyingTime: number;
  targetRestDuration: number;
  targetFlyDuration: number;
  targetSpotIndex: number | null;
  blinkType: BlinkPattern;
  blinkOffset: number;
  colorComponents: [number, number, number];
  trail: number[];
}

const wrapPhase = (phase: number) => {
  const twoPi = Math.PI * 2;
  const normalized = phase % twoPi;
  return normalized >= 0 ? normalized : normalized + twoPi;
};

const computeBlinkBrightness = (phase: number, type: BlinkPattern, offset: number) => {
  const normalizedPhase = wrapPhase(phase + offset);
  switch (type) {
    case "double": {
      const primary = Math.sin(normalizedPhase);
      const baseGlow = primary > 0 ? Math.pow(primary, 1.5) : 0;
      const echo = Math.sin(normalizedPhase * 2.1 + 0.9);
      const echoGlow = echo > 0 ? Math.pow(echo, 1.3) * 0.6 : 0;
      return 0.05 + (baseGlow + echoGlow) * 1.3;
    }
    case "breather": {
      const slowWave = (Math.sin(normalizedPhase * 0.5) + 1) / 2;
      return 0.2 + Math.pow(slowWave, 3) * 0.9;
    }
    case "single":
    default: {
      const sinValue = Math.sin(normalizedPhase);
      return sinValue > 0 ? Math.pow(sinValue, 2) * 1.3 + 0.05 : 0.05;
    }
  }
};

/**
 * 個別のホタルコンポーネント（Spring-basedアニメーション）
 */
interface FireflyInstanceProps {
  firefly: Firefly;
  cameraPosition: THREE.Vector3;
  time: number;
  onUpdate: (id: number, updates: Partial<Firefly>) => void;
}

const FireflyInstance: React.FC<FireflyInstanceProps> = ({ firefly, cameraPosition, time, onUpdate }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([firefly.x, firefly.y, firefly.z]);

  // Spring-basedアニメーション（framer-motionスタイル）
  const { position } = useSpring({
    position: targetPosition,
    config: {
      mass: 1,
      tension: 80,
      friction: 26,
    },
  });

  // 定期的に新しいターゲット位置を設定
  useFrame((_, delta) => {
    firefly.phase += firefly.phaseSpeed * (delta / IDEAL_FRAME_TIME);
    if (firefly.phase > Math.PI * 2) {
      firefly.phase -= Math.PI * 2;
    }

    if (firefly.isResting) {
      firefly.restingTime += delta;
      if (firefly.targetSpotIndex !== null) {
        const spot = RESTING_SPOTS[firefly.targetSpotIndex];
        if (spot.type === "lily") {
          const lily = LILY_DATA[spot.index];
          const waterHeight = WATER_HEIGHT_BASE + Math.sin(time * WATER_HEIGHT_FREQUENCY) * WATER_HEIGHT_AMPLITUDE;
          const localWave =
            Math.sin(lily.position[0] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
            Math.cos(lily.position[2] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
            LILY_WAVE_AMPLITUDE;
          const newX = lily.position[0] + Math.sin(firefly.time * 0.5) * 0.02;
          const newY = waterHeight + localWave + 0.1;
          const newZ = lily.position[2] + Math.cos(firefly.time * 0.5) * 0.02;
          setTargetPosition([newX, newY, newZ]);
          onUpdate(firefly.id, { x: newX, y: newY, z: newZ, time: firefly.time + 0.01 });
        } else {
          const plantRotation = Math.sin(time * 0.5) * 0.05;
          const plantPos = spot.position;
          const leafOffsetX = Math.sin(plantRotation) * 0.3;
          const leafOffsetZ = Math.cos(plantRotation) * 0.3;
          const newX = plantPos[0] + leafOffsetX + Math.sin(firefly.time * 0.5) * 0.02;
          const newY = plantPos[1] + 0.1;
          const newZ = plantPos[2] + leafOffsetZ + Math.cos(firefly.time * 0.5) * 0.02;
          setTargetPosition([newX, newY, newZ]);
          onUpdate(firefly.id, { x: newX, y: newY, z: newZ, time: firefly.time + 0.01 });
        }
      }
      if (firefly.restingTime >= firefly.targetRestDuration) {
        // 飛行開始
        const newX = firefly.x + (Math.random() - 0.5) * 4;
        const newY = firefly.y + (Math.random() - 0.5) * 2;
        const newZ = firefly.z + (Math.random() - 0.5) * 4;
        setTargetPosition([
          Math.max(SPAWN_AREA.X_MIN + 2, Math.min(SPAWN_AREA.X_MAX - 2, newX)),
          Math.max(SPAWN_AREA.Y_MIN + 0.3, Math.min(SPAWN_AREA.Y_MAX - 0.3, newY)),
          Math.max(SPAWN_AREA.Z_MIN + 2, Math.min(SPAWN_AREA.Z_MAX - 2, newZ)),
        ]);
        onUpdate(firefly.id, { isResting: false, restingTime: 0, flyingTime: 0, targetSpotIndex: null });
      }
    } else {
      firefly.flyingTime += delta;
      // 飛行中は定期的に方向を変える
      if (Math.random() < 0.02) {
        const globalBreeze = Math.sin(time * 0.12) * GLOBAL_BREEZE_STRENGTH * 100;
        const newX = firefly.x + (Math.random() - 0.5) * 3 + globalBreeze;
        const newY = firefly.y + (Math.random() - 0.5) * 2;
        const newZ = firefly.z + (Math.random() - 0.5) * 3;
        setTargetPosition([
          Math.max(SPAWN_AREA.X_MIN + 2, Math.min(SPAWN_AREA.X_MAX - 2, newX)),
          Math.max(SPAWN_AREA.Y_MIN + 0.3, Math.min(SPAWN_AREA.Y_MAX - 0.3, newY)),
          Math.max(SPAWN_AREA.Z_MIN + 2, Math.min(SPAWN_AREA.Z_MAX - 2, newZ)),
        ]);
      }

      if (firefly.flyingTime >= firefly.targetFlyDuration) {
        // 休憩場所に移動
        const spotIndex = Math.floor(Math.random() * RESTING_SPOTS.length);
        const targetSpot = RESTING_SPOTS[spotIndex];
        setTargetPosition([targetSpot.position[0], targetSpot.position[1] + 0.1, targetSpot.position[2]]);
        onUpdate(firefly.id, {
          isResting: true,
          restingTime: 0,
          flyingTime: 0,
          targetSpotIndex: spotIndex,
          targetRestDuration: RESTING_DURATION_MIN + Math.random() * (RESTING_DURATION_MAX - RESTING_DURATION_MIN),
        });
      }
    }
  });

  // 輝度計算
  const distance = useMemo(() => {
    return Math.sqrt(
      Math.pow(firefly.x - cameraPosition.x, 2) +
      Math.pow(firefly.y - cameraPosition.y, 2) +
      Math.pow(firefly.z - cameraPosition.z, 2)
    );
  }, [firefly.x, firefly.y, firefly.z, cameraPosition]);

  const distanceFactor = THREE.MathUtils.clamp(
    1 - distance / CAMERA_DISTANCE_FALLOFF,
    DISTANCE_BRIGHTNESS_MIN,
    DISTANCE_BRIGHTNESS_MAX
  );

  const brightness = Math.min(
    1.8,
    computeBlinkBrightness(firefly.phase, firefly.blinkType, firefly.blinkOffset) * distanceFactor
  );

  const color = useMemo(() => {
    return [
      firefly.colorComponents[0] * brightness,
      firefly.colorComponents[1] * brightness,
      firefly.colorComponents[2] * brightness,
    ] as [number, number, number];
  }, [firefly.colorComponents, brightness]);

  return (
    <animated.mesh ref={meshRef} position={position as any} scale={FIREFLY_SIZE * distanceFactor}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={1.0} toneMapped={false} />
    </animated.mesh>
  );
};

/**
 * ホタルエフェクトコンポーネント
 * Spring-basedアニメーション（framer-motionスタイル）を使用
 */
export const Fireflies: React.FC = () => {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const trailMeshRef = useRef<THREE.InstancedMesh>(null);
  const trailMatrixArrayRef = useRef<Float32Array | null>(null);
  const trailColorArrayRef = useRef<Float32Array | null>(null);
  const cameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const rng = useMemo(() => createRng(0x9876), []);
  const randomInRange = useCallback(
    (min: number, max: number) => randomBetween(rng, min, max),
    [rng]
  );

  // ホタルの初期化
  useMemo(() => {
    const newFireflies: Firefly[] = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const baseX = randomInRange(SPAWN_AREA.X_MIN, SPAWN_AREA.X_MAX);
      const baseY = randomInRange(SPAWN_AREA.Y_MIN, SPAWN_AREA.Y_MAX);
      const baseZ = randomInRange(SPAWN_AREA.Z_MIN, SPAWN_AREA.Z_MAX);
      const startResting = rng() < 0.4;
      const spotIndex = startResting ? Math.floor(randomInRange(0, RESTING_SPOTS.length)) : null;
      const spot = spotIndex !== null ? RESTING_SPOTS[spotIndex] : null;
      const startX = spot ? spot.position[0] : baseX;
      const startY = spot ? spot.position[1] + 0.1 : baseY;
      const startZ = spot ? spot.position[2] : baseZ;

      const color = new THREE.Color(FIREFLY_COLOR);
      const hsl = { h: 0, s: 0, l: 0 };
      color.getHSL(hsl);
      color.setHSL(
        THREE.MathUtils.euclideanModulo(hsl.h + randomInRange(-0.02, 0.03), 1),
        THREE.MathUtils.clamp(hsl.s + randomInRange(-0.08, 0.06), 0, 1),
        THREE.MathUtils.clamp(hsl.l + randomInRange(-0.12, 0.12), 0, 1)
      );
      const colorComponents: [number, number, number] = [color.r, color.g, color.b];

      const trail: number[] = [];
      for (let t = 0; t < TRAIL_SEGMENTS; t++) {
        trail.push(startX, startY, startZ);
      }

      newFireflies.push({
        id: i,
        x: startX,
        y: startY,
        z: startZ,
        time: randomInRange(0, 100),
        phase: randomInRange(0, Math.PI * 2),
        phaseSpeed: randomInRange(0.08, 0.15),
        isResting: startResting,
        restingTime: 0,
        flyingTime: 0,
        targetRestDuration: randomInRange(RESTING_DURATION_MIN, RESTING_DURATION_MAX),
        targetFlyDuration: randomInRange(FLYING_DURATION_MIN, FLYING_DURATION_MAX),
        targetSpotIndex: spotIndex,
        blinkType: BLINK_PATTERNS[Math.floor(randomInRange(0, BLINK_PATTERNS.length))],
        blinkOffset: randomInRange(0, Math.PI * 2),
        colorComponents,
        trail,
      });
    }
    setFireflies(newFireflies);
  }, [randomInRange, rng]);

  // ホタルの状態を更新
  const handleFireflyUpdate = useCallback((id: number, updates: Partial<Firefly>) => {
    setFireflies((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  // トレイルの更新
  useFrame((state) => {
    cameraPositionRef.current.copy(state.camera.position);
    const trailMesh = trailMeshRef.current;
    if (!trailMesh) return;

    const trailMatrixArray =
      trailMatrixArrayRef.current ??
      (() => {
        trailMatrixArrayRef.current = new Float32Array(TRAIL_INSTANCE_COUNT * 16);
        return trailMatrixArrayRef.current;
      })();

    const trailColorArray =
      trailColorArrayRef.current ??
      (() => {
        trailColorArrayRef.current = new Float32Array(TRAIL_INSTANCE_COUNT * 3);
        return trailColorArrayRef.current;
      })();

    const positionMatrix = new THREE.Matrix4();
    const scaleMatrix = new THREE.Matrix4();
    const tempVector = new THREE.Vector3();

    for (let i = 0; i < fireflies.length; i++) {
      const firefly = fireflies[i];

      // トレイルを更新
      firefly.trail.unshift(firefly.x, firefly.y, firefly.z);
      if (firefly.trail.length > TRAIL_SEGMENTS * 3) {
        firefly.trail.length = TRAIL_SEGMENTS * 3;
      }
      while (firefly.trail.length < TRAIL_SEGMENTS * 3) {
        firefly.trail.push(firefly.x, firefly.y, firefly.z);
      }

      tempVector.set(firefly.x, firefly.y, firefly.z);
      const distance = tempVector.distanceTo(state.camera.position);
      const distanceFactor = THREE.MathUtils.clamp(
        1 - distance / CAMERA_DISTANCE_FALLOFF,
        DISTANCE_BRIGHTNESS_MIN,
        DISTANCE_BRIGHTNESS_MAX
      );
      const brightness = Math.min(
        1.8,
        computeBlinkBrightness(firefly.phase, firefly.blinkType, firefly.blinkOffset) * distanceFactor
      );

      for (let t = 0; t < TRAIL_SEGMENTS; t++) {
        const index = i * TRAIL_SEGMENTS + t;
        const tx = firefly.trail[t * 3];
        const ty = firefly.trail[t * 3 + 1];
        const tz = firefly.trail[t * 3 + 2];
        positionMatrix.makeTranslation(tx, ty, tz);
        const fade = Math.pow(TRAIL_FADE, t + 1);
        const trailScale = FIREFLY_SIZE * fade * distanceFactor * 0.9;
        scaleMatrix.makeScale(trailScale, trailScale, trailScale);
        positionMatrix.multiply(scaleMatrix);
        positionMatrix.toArray(trailMatrixArray, index * 16);
        const trailBrightness = brightness * fade;
        trailColorArray[index * 3] = firefly.colorComponents[0] * trailBrightness;
        trailColorArray[index * 3 + 1] = firefly.colorComponents[1] * trailBrightness;
        trailColorArray[index * 3 + 2] = firefly.colorComponents[2] * trailBrightness;
      }
    }

    trailMesh.instanceMatrix.array.set(trailMatrixArray);
    trailMesh.instanceMatrix.needsUpdate = true;
    if (trailMesh.instanceColor) {
      trailMesh.instanceColor.array.set(trailColorArray);
      trailMesh.instanceColor.needsUpdate = true;
    }
  });

  const trailGeometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const trailMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FIREFLY_COLOR,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        toneMapped: false,
      }),
    []
  );

  return (
    <>
      {fireflies.map((firefly) => (
        <FireflyInstance
          key={firefly.id}
          firefly={firefly}
          cameraPosition={cameraPositionRef.current}
          time={0}
          onUpdate={handleFireflyUpdate}
        />
      ))}
      <instancedMesh ref={trailMeshRef} args={[trailGeometry, trailMaterial, TRAIL_INSTANCE_COUNT]}>
        <instancedBufferAttribute attach="instanceColor" args={[new Float32Array(TRAIL_INSTANCE_COUNT * 3), 3]} />
      </instancedMesh>
    </>
  );
};
