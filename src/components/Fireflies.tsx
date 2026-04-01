import React, { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
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
const SPEED = {
  BASE: 0.025, // ゆっくり優雅に
  VARIATION: 0.015,
};

const BLINK_PATTERNS = ["single", "double", "breather"] as const;
type BlinkPattern = (typeof BLINK_PATTERNS)[number];

/** ホタルの状態データ */
interface Firefly {
  id: number;
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  time: number;
  frequencyX: number;
  frequencyY: number;
  frequencyZ: number;
  amplitudeX: number;
  amplitudeY: number;
  amplitudeZ: number;
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
 * ホタルエフェクトコンポーネント
 * 夏の夜に発光しながら浮遊するホタルを表示
 */
export const Fireflies: React.FC = () => {
  const firefliesRef = useRef<Firefly[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const trailMeshRef = useRef<THREE.InstancedMesh>(null);
  const matrixArrayRef = useRef<Float32Array | null>(null);
  const colorArrayRef = useRef<Float32Array | null>(null);
  const trailMatrixArrayRef = useRef<Float32Array | null>(null);
  const trailColorArrayRef = useRef<Float32Array | null>(null);

  const rng = useMemo(() => createRng(0x9876), []);
  const randomInRange = useCallback(
    (min: number, max: number) => randomBetween(rng, min, max),
    [rng]
  );

  const scaleMatrix = useMemo(() => new THREE.Matrix4(), []);
  const positionMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []);

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
        baseX: startX,
        baseY: startY,
        baseZ: startZ,
        time: randomInRange(0, 100),
        frequencyX: randomInRange(0.4, 0.8),
        frequencyY: randomInRange(0.5, 0.9),
        frequencyZ: randomInRange(0.4, 0.8),
        amplitudeX: randomInRange(1.2, 2.5),
        amplitudeY: randomInRange(0.8, 1.8),
        amplitudeZ: randomInRange(1.2, 2.5),
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
    firefliesRef.current = newFireflies;
  }, [randomInRange, rng]);

  // アニメーションループ
  useFrame((state, delta) => {
    if (!instancedMeshRef.current) return;

    const fireflies = firefliesRef.current;
    const mesh = instancedMeshRef.current;
    const trailMesh = trailMeshRef.current;
    const time = state.clock.getElapsedTime();
    const deltaTime = delta;
    const deltaFactor = deltaTime / IDEAL_FRAME_TIME;
    const cameraPosition = state.camera.position;
    const globalBreeze = Math.sin(time * 0.12) * GLOBAL_BREEZE_STRENGTH;

    const matrixArray =
      matrixArrayRef.current ??
      (() => {
        matrixArrayRef.current = new Float32Array(fireflies.length * 16);
        return matrixArrayRef.current;
      })();

    const colorArray =
      colorArrayRef.current ??
      (() => {
        colorArrayRef.current = new Float32Array(fireflies.length * 3);
        return colorArrayRef.current;
      })();

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

    for (let i = 0; i < fireflies.length; i++) {
      const firefly = fireflies[i];

      firefly.time += (SPEED.BASE + Math.sin(firefly.time * 0.1) * SPEED.VARIATION) * deltaFactor;
      firefly.phase += firefly.phaseSpeed * deltaFactor;
      if (firefly.phase > Math.PI * 2) {
        firefly.phase -= Math.PI * 2;
      }

      // さざ波に合わせたゆるい集団ドリフト
      const driftWeight = firefly.isResting ? 0.2 : 1;
      firefly.baseX += globalBreeze * driftWeight;
      firefly.baseZ += Math.cos(time * 0.07 + firefly.id) * 0.002 * deltaFactor;

      if (firefly.isResting) {
        firefly.restingTime += deltaTime;
        if (firefly.targetSpotIndex !== null) {
          const spot = RESTING_SPOTS[firefly.targetSpotIndex];
          if (spot.type === "lily") {
            const lily = LILY_DATA[spot.index];
            const waterHeight = WATER_HEIGHT_BASE + Math.sin(time * WATER_HEIGHT_FREQUENCY) * WATER_HEIGHT_AMPLITUDE;
            const localWave =
              Math.sin(lily.position[0] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
              Math.cos(lily.position[2] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
              LILY_WAVE_AMPLITUDE;
            firefly.x = lily.position[0] + Math.sin(firefly.time * 0.5) * 0.02;
            firefly.y = waterHeight + localWave + 0.1;
            firefly.z = lily.position[2] + Math.cos(firefly.time * 0.5) * 0.02;
          } else {
            const plantRotation = Math.sin(time * 0.5) * 0.05;
            const plantPos = spot.position;
            const leafOffsetX = Math.sin(plantRotation) * 0.3;
            const leafOffsetZ = Math.cos(plantRotation) * 0.3;
            firefly.x = plantPos[0] + leafOffsetX + Math.sin(firefly.time * 0.5) * 0.02;
            firefly.y = plantPos[1] + 0.1;
            firefly.z = plantPos[2] + leafOffsetZ + Math.cos(firefly.time * 0.5) * 0.02;
          }
        }
        if (firefly.restingTime >= firefly.targetRestDuration) {
          firefly.isResting = false;
          firefly.restingTime = 0;
          firefly.flyingTime = 0;
          firefly.targetFlyDuration = randomInRange(FLYING_DURATION_MIN, FLYING_DURATION_MAX);
          firefly.targetSpotIndex = null;
          firefly.baseX = firefly.x;
          firefly.baseY = firefly.y;
          firefly.baseZ = firefly.z;
        }
      } else {
        firefly.flyingTime += deltaTime;
        const offsetX = Math.sin(firefly.time * firefly.frequencyX) * firefly.amplitudeX;
        const offsetY = Math.sin(firefly.time * firefly.frequencyY) * firefly.amplitudeY;
        const offsetZ = Math.cos(firefly.time * firefly.frequencyZ) * firefly.amplitudeZ;
        firefly.x = firefly.baseX + offsetX;
        firefly.y = firefly.baseY + offsetY;
        firefly.z = firefly.baseZ + offsetZ;
        firefly.baseX += Math.sin(firefly.time * 0.04) * 0.015;
        firefly.baseY += Math.cos(firefly.time * 0.03) * 0.012;
        firefly.baseZ += Math.sin(firefly.time * 0.035) * 0.015;
        firefly.baseX = Math.max(SPAWN_AREA.X_MIN + 2, Math.min(SPAWN_AREA.X_MAX - 2, firefly.baseX));
        firefly.baseY = Math.max(SPAWN_AREA.Y_MIN + 0.3, Math.min(SPAWN_AREA.Y_MAX - 0.3, firefly.baseY));
        firefly.baseZ = Math.max(SPAWN_AREA.Z_MIN + 2, Math.min(SPAWN_AREA.Z_MAX - 2, firefly.baseZ));
        if (firefly.flyingTime >= firefly.targetFlyDuration) {
          firefly.targetSpotIndex = Math.floor(randomInRange(0, RESTING_SPOTS.length));
          const targetSpot = RESTING_SPOTS[firefly.targetSpotIndex];
          firefly.baseX = targetSpot.position[0];
          firefly.baseY = targetSpot.position[1] + 0.1;
          firefly.baseZ = targetSpot.position[2];
          firefly.isResting = true;
          firefly.restingTime = 0;
          firefly.flyingTime = 0;
          firefly.targetRestDuration = randomInRange(RESTING_DURATION_MIN, RESTING_DURATION_MAX);
        }
      }

      tempVector.set(firefly.x, firefly.y, firefly.z);
      const distance = tempVector.distanceTo(cameraPosition);
      const distanceFactor = THREE.MathUtils.clamp(
        1 - distance / CAMERA_DISTANCE_FALLOFF,
        DISTANCE_BRIGHTNESS_MIN,
        DISTANCE_BRIGHTNESS_MAX
      );
      const brightness = Math.min(
        1.8,
        computeBlinkBrightness(firefly.phase, firefly.blinkType, firefly.blinkOffset) * distanceFactor
      );

      firefly.trail.unshift(firefly.x, firefly.y, firefly.z);
      if (firefly.trail.length > TRAIL_SEGMENTS * 3) {
        firefly.trail.length = TRAIL_SEGMENTS * 3;
      }
      while (firefly.trail.length < TRAIL_SEGMENTS * 3) {
        firefly.trail.push(firefly.x, firefly.y, firefly.z);
      }

      positionMatrix.makeTranslation(firefly.x, firefly.y, firefly.z);
      const fireflyScale = FIREFLY_SIZE * distanceFactor;
      scaleMatrix.makeScale(fireflyScale, fireflyScale, fireflyScale);
      positionMatrix.multiply(scaleMatrix);
      positionMatrix.toArray(matrixArray, i * 16);

      colorArray[i * 3] = firefly.colorComponents[0] * brightness;
      colorArray[i * 3 + 1] = firefly.colorComponents[1] * brightness;
      colorArray[i * 3 + 2] = firefly.colorComponents[2] * brightness;

      if (trailMesh) {
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
    }

    mesh.instanceMatrix.array.set(matrixArray);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.array.set(colorArray);
      mesh.instanceColor.needsUpdate = true;
    }

    if (trailMesh) {
      trailMesh.instanceMatrix.array.set(trailMatrixArray);
      trailMesh.instanceMatrix.needsUpdate = true;
      if (trailMesh.instanceColor) {
        trailMesh.instanceColor.array.set(trailColorArray);
        trailMesh.instanceColor.needsUpdate = true;
      }
    }
  });

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FIREFLY_COLOR,
        transparent: true,
        opacity: 1.0,
        toneMapped: false,
      }),
    []
  );

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
      <instancedMesh ref={instancedMeshRef} args={[geometry, material, FIREFLY_COUNT]}>
        <instancedBufferAttribute attach="instanceColor" args={[new Float32Array(FIREFLY_COUNT * 3), 3]} />
      </instancedMesh>
      <instancedMesh ref={trailMeshRef} args={[geometry, trailMaterial, TRAIL_INSTANCE_COUNT]}>
        <instancedBufferAttribute attach="instanceColor" args={[new Float32Array(TRAIL_INSTANCE_COUNT * 3), 3]} />
      </instancedMesh>
    </>
  );
};
