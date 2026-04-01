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
const FIREFLY_COUNT = 18; // パフォーマンスと美しさのバランス
const FIREFLY_COLOR = "#CDFF00";
const FIREFLY_SIZE = 0.08;
const FIREFLY_SIZE_VARIATION = 0.04; // サイズのバリエーション
const RESTING_DURATION_MIN = 3; // 止まる時間（秒）
const RESTING_DURATION_MAX = 6;
const FLYING_DURATION_MIN = 8; // 飛ぶ時間（秒）
const FLYING_DURATION_MAX = 15;
const IDEAL_FRAME_TIME = 1 / 60; // 60fps を基準
const TRAIL_SEGMENTS = 10; // パフォーマンスと美しさのバランス
const TRAIL_FADE = 0.75; // よりなめらかに
const CAMERA_DISTANCE_FALLOFF = 28;
const DISTANCE_BRIGHTNESS_MIN = 0.7; // 最小輝度を上げる
const DISTANCE_BRIGHTNESS_MAX = 2.0; // より明るく
const GLOBAL_BREEZE_STRENGTH = 0.0015; // より穏やかな風
const TRAIL_INSTANCE_COUNT = FIREFLY_COUNT * TRAIL_SEGMENTS;
const GLOW_SIZE_MULTIPLIER = 2.5; // グロー効果を強化

const SPAWN_AREA = {
  X_MIN: -8,
  X_MAX: 8,
  Y_MIN: 9, // 水面(Y=8)より上
  Y_MAX: 12,
  Z_MIN: -8,
  Z_MAX: 8,
};
const SPEED = {
  BASE: 0.018, // よりゆっくり優雅に
  VARIATION: 0.005, // 速度変化を最小限に
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
  size: number; // 個体ごとのサイズ
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
      const baseGlow = primary > 0 ? Math.pow(primary, 1.8) : 0; // よりなめらかに
      const echo = Math.sin(normalizedPhase * 2.1 + 0.9);
      const echoGlow = echo > 0 ? Math.pow(echo, 1.5) * 0.7 : 0;
      return 0.15 + (baseGlow + echoGlow) * 1.5; // 明るさを強化
    }
    case "breather": {
      const slowWave = (Math.sin(normalizedPhase * 0.5) + 1) / 2;
      return 0.3 + Math.pow(slowWave, 2.5) * 1.2; // よりなめらかで明るく
    }
    case "single":
    default: {
      const sinValue = Math.sin(normalizedPhase);
      return sinValue > 0 ? Math.pow(sinValue, 1.8) * 1.5 + 0.15 : 0.15; // なめらかで明るく
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

      // 幻想的な色のバリエーション: 黄緑〜青緑〜薄紫
      const colorVariation = randomInRange(0, 1);
      let hue: number;
      if (colorVariation < 0.6) {
        // 60%: 黄緑〜緑（0.15 - 0.25）
        hue = randomInRange(0.15, 0.25);
      } else if (colorVariation < 0.9) {
        // 30%: 青緑（0.45 - 0.55）
        hue = randomInRange(0.45, 0.55);
      } else {
        // 10%: 薄紫（0.7 - 0.8）
        hue = randomInRange(0.7, 0.8);
      }
      const color = new THREE.Color();
      color.setHSL(
        hue,
        THREE.MathUtils.clamp(0.8 + randomInRange(-0.1, 0.2), 0.6, 1.0), // 高彩度
        THREE.MathUtils.clamp(0.6 + randomInRange(-0.1, 0.2), 0.5, 0.8)  // 明るめ
      );
      const colorComponents: [number, number, number] = [color.r, color.g, color.b];

      // サイズのバリエーション
      const size = FIREFLY_SIZE + randomInRange(-FIREFLY_SIZE_VARIATION, FIREFLY_SIZE_VARIATION);

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
        frequencyX: randomInRange(0.15, 0.35), // ゆっくりした周波数
        frequencyY: randomInRange(0.2, 0.4),   // ゆっくりした周波数
        frequencyZ: randomInRange(0.15, 0.35), // ゆっくりした周波数
        amplitudeX: randomInRange(0.6, 1.2),   // 穏やかな振幅
        amplitudeY: randomInRange(0.4, 1.0),   // 穏やかな振幅
        amplitudeZ: randomInRange(0.6, 1.2),   // 穏やかな振幅
        phase: randomInRange(0, Math.PI * 2),
        phaseSpeed: randomInRange(0.06, 0.12), // ゆっくりした点滅
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
        size,
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

      // より一定の速度で進む
      firefly.time += (SPEED.BASE + Math.sin(firefly.time * 0.05) * SPEED.VARIATION) * deltaFactor;
      firefly.phase += firefly.phaseSpeed * deltaFactor;
      if (firefly.phase > Math.PI * 2) {
        firefly.phase -= Math.PI * 2;
      }

      // さざ波に合わせたゆるい集団ドリフト（さらに穏やかに）
      const driftWeight = firefly.isResting ? 0.1 : 0.5;
      firefly.baseX += globalBreeze * driftWeight;
      firefly.baseZ += Math.cos(time * 0.05 + firefly.id) * 0.001 * deltaFactor;

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
        // よりゆっくりとした基準位置の移動
        firefly.baseX += Math.sin(firefly.time * 0.02) * 0.008;
        firefly.baseY += Math.cos(firefly.time * 0.015) * 0.006;
        firefly.baseZ += Math.sin(firefly.time * 0.018) * 0.008;
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
        2.5, // より明るく幻想的に
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
      const fireflyScale = firefly.size * distanceFactor * GLOW_SIZE_MULTIPLIER; // グロー効果
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
          const trailScale = firefly.size * fade * distanceFactor * 1.8; // トレイルを大きく
          scaleMatrix.makeScale(trailScale, trailScale, trailScale);
          positionMatrix.multiply(scaleMatrix);
          positionMatrix.toArray(trailMatrixArray, index * 16);
          const trailBrightness = brightness * fade * 0.8; // トレイルの明るさを調整
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
        opacity: 0.7, // よりソフトなグロー
        toneMapped: false,
        blending: THREE.AdditiveBlending, // 加算合成で幻想的に
        depthWrite: false,
      }),
    []
  );

  const trailMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FIREFLY_COLOR,
        transparent: true,
        opacity: 0.4, // トレイルはさらに薄く
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending, // 加算合成で幻想的に
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
