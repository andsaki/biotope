import React, { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng, randomBetween } from "../utils/random";

/** ホタルの設定 */
const FIREFLY_COUNT = 30;
const FIREFLY_COLOR = "#CDFF00";
const FIREFLY_SIZE = 0.12;
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

/** ホタルの状態データ */
interface Firefly {
  id: number;
  x: number;
  y: number;
  z: number;
  baseX: number; // 基準位置X
  baseY: number; // 基準位置Y
  baseZ: number; // 基準位置Z
  time: number; // 経過時間（動きの計算用）
  frequencyX: number; // X方向の振動周波数
  frequencyY: number; // Y方向の振動周波数
  frequencyZ: number; // Z方向の振動周波数
  amplitudeX: number; // X方向の振幅
  amplitudeY: number; // Y方向の振幅
  amplitudeZ: number; // Z方向の振幅
  phase: number; // 点滅のフェーズ（0-2π）
  phaseSpeed: number; // 点滅速度
}

/**
 * ホタルエフェクトコンポーネント
 * 夏の夜に発光しながら浮遊するホタルを表示
 */
export const Fireflies: React.FC = () => {
  const firefliesRef = useRef<Firefly[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const matrixArrayRef = useRef<Float32Array | null>(null);
  const colorArrayRef = useRef<Float32Array | null>(null);

  const rng = useMemo(() => createRng(0x9876), []);
  const randomInRange = useCallback(
    (min: number, max: number) => randomBetween(rng, min, max),
    [rng]
  );

  const scaleMatrix = useMemo(() => new THREE.Matrix4(), []);
  const positionMatrix = useMemo(() => new THREE.Matrix4(), []);

  // ホタルの初期化
  useMemo(() => {
    const newFireflies: Firefly[] = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const baseX = randomInRange(SPAWN_AREA.X_MIN, SPAWN_AREA.X_MAX);
      const baseY = randomInRange(SPAWN_AREA.Y_MIN, SPAWN_AREA.Y_MAX);
      const baseZ = randomInRange(SPAWN_AREA.Z_MIN, SPAWN_AREA.Z_MAX);
      newFireflies.push({
        id: i,
        x: baseX,
        y: baseY,
        z: baseZ,
        baseX,
        baseY,
        baseZ,
        time: randomInRange(0, 100), // ランダムな開始時刻
        frequencyX: randomInRange(0.4, 0.8),
        frequencyY: randomInRange(0.5, 0.9),
        frequencyZ: randomInRange(0.4, 0.8),
        amplitudeX: randomInRange(1.2, 2.5),
        amplitudeY: randomInRange(0.8, 1.8),
        amplitudeZ: randomInRange(1.2, 2.5),
        phase: randomInRange(0, Math.PI * 2),
        phaseSpeed: randomInRange(0.08, 0.15), // 点滅速度は維持
      });
    }
    firefliesRef.current = newFireflies;
  }, [randomInRange]);

  // アニメーションループ
  useFrame(() => {
    if (!instancedMeshRef.current) return;

    const fireflies = firefliesRef.current;
    const mesh = instancedMeshRef.current;

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

    for (let i = 0; i < fireflies.length; i++) {
      const firefly = fireflies[i];

      // 時間を進める
      firefly.time += SPEED.BASE + Math.sin(firefly.time * 0.1) * SPEED.VARIATION;

      // sin波による自然な浮遊動作（8の字や円を描くような動き）
      const offsetX = Math.sin(firefly.time * firefly.frequencyX) * firefly.amplitudeX;
      const offsetY = Math.sin(firefly.time * firefly.frequencyY) * firefly.amplitudeY;
      const offsetZ = Math.cos(firefly.time * firefly.frequencyZ) * firefly.amplitudeZ;

      // 基準位置 + オフセット
      firefly.x = firefly.baseX + offsetX;
      firefly.y = firefly.baseY + offsetY;
      firefly.z = firefly.baseZ + offsetZ;

      // 基準位置を移動（範囲内でドリフト、ゆっくりと）
      firefly.baseX += Math.sin(firefly.time * 0.04) * 0.015;
      firefly.baseY += Math.cos(firefly.time * 0.03) * 0.012;
      firefly.baseZ += Math.sin(firefly.time * 0.035) * 0.015;

      // 範囲外に出ないように基準位置を制限
      firefly.baseX = Math.max(SPAWN_AREA.X_MIN + 2, Math.min(SPAWN_AREA.X_MAX - 2, firefly.baseX));
      firefly.baseY = Math.max(SPAWN_AREA.Y_MIN + 0.3, Math.min(SPAWN_AREA.Y_MAX - 0.3, firefly.baseY));
      firefly.baseZ = Math.max(SPAWN_AREA.Z_MIN + 2, Math.min(SPAWN_AREA.Z_MAX - 2, firefly.baseZ));

      // 点滅アニメーション（sin波の累乗で一瞬だけ強く光る）
      firefly.phase += firefly.phaseSpeed;
      if (firefly.phase > Math.PI * 2) {
        firefly.phase -= Math.PI * 2;
      }

      // 明るさ（0.05〜1.5で大きく変動、ピークで強く光る）
      const sinValue = Math.sin(firefly.phase);
      const brightness = sinValue > 0
        ? Math.pow(sinValue, 2) * 1.5 // 光る時は強く
        : 0.05; // 消える時はほぼ見えない

      // 位置行列を更新
      positionMatrix.makeTranslation(firefly.x, firefly.y, firefly.z);
      scaleMatrix.makeScale(FIREFLY_SIZE, FIREFLY_SIZE, FIREFLY_SIZE);
      positionMatrix.multiply(scaleMatrix);
      positionMatrix.toArray(matrixArray, i * 16);

      // 色を更新（発光の強さ）
      const color = new THREE.Color(FIREFLY_COLOR);
      colorArray[i * 3] = color.r * brightness;
      colorArray[i * 3 + 1] = color.g * brightness;
      colorArray[i * 3 + 2] = color.b * brightness;
    }

    mesh.instanceMatrix.array.set(matrixArray);
    mesh.instanceMatrix.needsUpdate = true;

    // 色の更新
    if (mesh.instanceColor) {
      mesh.instanceColor.array.set(colorArray);
      mesh.instanceColor.needsUpdate = true;
    }
  });

  const geometry = useMemo(
    () => new THREE.SphereGeometry(1, 8, 8),
    []
  );

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FIREFLY_COLOR,
        transparent: true,
        opacity: 1.0,
        toneMapped: false, // ブルーム効果のため
      }),
    []
  );

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, FIREFLY_COUNT]}
    >
      <instancedBufferAttribute
        attach="instanceColor"
        args={[new Float32Array(FIREFLY_COUNT * 3), 3]}
      />
    </instancedMesh>
  );
};
