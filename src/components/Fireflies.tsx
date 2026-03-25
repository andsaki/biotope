import React, { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createRng, randomBetween } from "../utils/random";

/** ホタルの設定 */
const FIREFLY_COUNT = 25;
const FIREFLY_COLOR = "#AAFF00";
const FIREFLY_SIZE = 0.08;
const SPAWN_AREA = {
  X_MIN: -8,
  X_MAX: 8,
  Y_MIN: 1,
  Y_MAX: 4,
  Z_MIN: -8,
  Z_MAX: 8,
};
const SPEED = {
  X: 0.002,
  Y: 0.001,
  Z: 0.002,
};

/** ホタルの状態データ */
interface Firefly {
  id: number;
  x: number;
  y: number;
  z: number;
  speedX: number;
  speedY: number;
  speedZ: number;
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
      newFireflies.push({
        id: i,
        x: randomInRange(SPAWN_AREA.X_MIN, SPAWN_AREA.X_MAX),
        y: randomInRange(SPAWN_AREA.Y_MIN, SPAWN_AREA.Y_MAX),
        z: randomInRange(SPAWN_AREA.Z_MIN, SPAWN_AREA.Z_MAX),
        speedX: randomInRange(-SPEED.X, SPEED.X),
        speedY: randomInRange(-SPEED.Y, SPEED.Y),
        speedZ: randomInRange(-SPEED.Z, SPEED.Z),
        phase: randomInRange(0, Math.PI * 2),
        phaseSpeed: randomInRange(0.02, 0.05),
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

      // ゆっくり浮遊
      firefly.x += firefly.speedX;
      firefly.y += firefly.speedY;
      firefly.z += firefly.speedZ;

      // 範囲外に出たら反転
      if (firefly.x < SPAWN_AREA.X_MIN || firefly.x > SPAWN_AREA.X_MAX) {
        firefly.speedX *= -1;
      }
      if (firefly.y < SPAWN_AREA.Y_MIN || firefly.y > SPAWN_AREA.Y_MAX) {
        firefly.speedY *= -1;
      }
      if (firefly.z < SPAWN_AREA.Z_MIN || firefly.z > SPAWN_AREA.Z_MAX) {
        firefly.speedZ *= -1;
      }

      // 点滅アニメーション（sin波）
      firefly.phase += firefly.phaseSpeed;
      if (firefly.phase > Math.PI * 2) {
        firefly.phase -= Math.PI * 2;
      }

      // 明るさ（0.2〜1.0で変動）
      const brightness = 0.2 + Math.sin(firefly.phase) * 0.4 + 0.4;

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
