import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  PARTICLE_COUNT,
  PARTICLE_COLOR,
  PARTICLE_SPEED_Y,
  PARTICLE_SIZE_MODIFIER,
  PARTICLE_BASE_SIZE_MIN,
  PARTICLE_BASE_SIZE_VARIATION,
  PARTICLE_SPAWN,
  PARTICLE_SPEED_X_MIN,
  PARTICLE_SPEED_X_MAX,
  PARTICLE_SPEED_Z_MIN,
  PARTICLE_SPEED_Z_MAX,
  PARTICLE_LIFE_MIN,
  PARTICLE_LIFE_VARIATION,
  PARTICLE_RESET_Y,
  PARTICLE_FRAME_SKIP,
  PARTICLE_SPEED_MULTIPLIER,
  PARTICLE_OPACITY,
  PARTICLE_GEOMETRY_SIZE,
} from "../constants/particle";
import { createRng, randomBetween } from "../utils/random";

/** パーティクルの状態データ */
interface Particle {
  /** パーティクルID */
  id: number;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** Z座標 */
  z: number;
  /** X方向の速度 */
  speedX: number;
  /** Y方向の速度 */
  speedY: number;
  /** Z方向の速度 */
  speedZ: number;
  /** パーティクルの色 */
  color: string;
  /** パーティクルのサイズ */
  size: number;
  /** パーティクルの寿命 */
  life: number;
}

/**
 * インスタンス化されたパーティクルレイヤーコンポーネント
 * 季節に応じたパーティクルエフェクトを最適化されたレンダリングで表示
 */
const ParticleLayerInstanced: React.FC = () => {
  const { season } = useSeason();
  const particlesRef = useRef<Particle[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const frameCount = useRef(0);
  const matrixArrayRef = useRef<Float32Array | null>(null);
  const rng = useMemo(() => createRng(0x1a2b3c4d), []);
  const randomInRange = useCallback(
    (min: number, max: number) => randomBetween(rng, min, max),
    [rng]
  );
  const scaleMatrix = useMemo(() => new THREE.Matrix4(), []);
  const positionMatrix = useMemo(() => new THREE.Matrix4(), []);

  // 季節に応じたパーティクル設定
  const particleConfig = useMemo(() => {
    let particleColor: string;
    let particleCount: number;
    let speedYRange: [number, number];
    let particleSizeModifier: number;
    let geometry: THREE.BufferGeometry;

    switch (season) {
      case "spring":
        particleColor = PARTICLE_COLOR.SPRING;
        particleCount = PARTICLE_COUNT.SPRING;
        speedYRange = PARTICLE_SPEED_Y.SPRING;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.SPRING;
        geometry = new THREE.PlaneGeometry(
          PARTICLE_GEOMETRY_SIZE.SPRING_WIDTH,
          PARTICLE_GEOMETRY_SIZE.SPRING_HEIGHT,
          1
        );
        break;
      case "summer":
        particleColor = PARTICLE_COLOR.SUMMER;
        particleCount = PARTICLE_COUNT.SUMMER;
        speedYRange = PARTICLE_SPEED_Y.SUMMER;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.SUMMER;
        geometry = new THREE.SphereGeometry(
          0.5,
          PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS,
          PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS
        );
        break;
      case "autumn":
        particleColor = PARTICLE_COLOR.AUTUMN;
        particleCount = PARTICLE_COUNT.AUTUMN;
        speedYRange = PARTICLE_SPEED_Y.AUTUMN;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.AUTUMN;
        geometry = new THREE.PlaneGeometry(
          PARTICLE_GEOMETRY_SIZE.AUTUMN_WIDTH,
          PARTICLE_GEOMETRY_SIZE.AUTUMN_HEIGHT,
          1
        );
        break;
      case "winter":
        particleColor = PARTICLE_COLOR.WINTER;
        particleCount = PARTICLE_COUNT.WINTER;
        speedYRange = PARTICLE_SPEED_Y.WINTER;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.WINTER;
        geometry = new THREE.SphereGeometry(
          0.5,
          PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS,
          PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS
        );
        break;
      default:
        particleColor = PARTICLE_COLOR.DEFAULT;
        particleCount = PARTICLE_COUNT.DEFAULT;
        speedYRange = PARTICLE_SPEED_Y.DEFAULT;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.DEFAULT;
        geometry = new THREE.SphereGeometry(0.5, 8, 8);
    }

    return { particleColor, particleCount, speedYRange, particleSizeModifier, geometry };
  }, [season]);

  // パーティクルの初期化
  useEffect(() => {
    const newParticles: Particle[] = [];
    const { particleColor, particleCount, speedYRange, particleSizeModifier } = particleConfig;

    for (let i = 0; i < particleCount; i++) {
      const baseSize = randomInRange(PARTICLE_BASE_SIZE_MIN, PARTICLE_BASE_SIZE_MIN + PARTICLE_BASE_SIZE_VARIATION);
      const finalSize = baseSize * particleSizeModifier;
      newParticles.push({
        id: i,
        x: randomInRange(PARTICLE_SPAWN.X_MIN, PARTICLE_SPAWN.X_MAX),
        y: randomInRange(0, PARTICLE_SPAWN.Y_MAX),
        z: randomInRange(PARTICLE_SPAWN.Z_MIN, PARTICLE_SPAWN.Z_MAX),
        speedX: randomInRange(PARTICLE_SPEED_X_MIN, PARTICLE_SPEED_X_MAX),
        speedY: randomInRange(speedYRange[0], speedYRange[1]),
        speedZ: randomInRange(PARTICLE_SPEED_Z_MIN, PARTICLE_SPEED_Z_MAX),
        color: particleColor,
        size: finalSize,
        life: randomInRange(PARTICLE_LIFE_MIN, PARTICLE_LIFE_MIN + PARTICLE_LIFE_VARIATION),
      });
    }
    particlesRef.current = newParticles;
  }, [particleConfig, randomInRange]);

  // speedYRangeを定数としてキャッシュしてパフォーマンス向上
  const speedYRange = useMemo(() => particleConfig.speedYRange, [particleConfig.speedYRange]);

  // アニメーションループ
  useFrame(() => {
    frameCount.current++;
    // パフォーマンス向上のためフレームスキップ
    if (frameCount.current % PARTICLE_FRAME_SKIP !== 0) return;

    if (!instancedMeshRef.current) return;

    const particles = particlesRef.current;
    const mesh = instancedMeshRef.current;
    const matrixArray =
      matrixArrayRef.current ??
      (() => {
        matrixArrayRef.current = new Float32Array(particles.length * 16);
        return matrixArrayRef.current;
      })();

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // パーティクルの位置を更新
      particle.y -= particle.speedY * PARTICLE_SPEED_MULTIPLIER;
      particle.x += particle.speedX * PARTICLE_SPEED_MULTIPLIER;
      particle.z += particle.speedZ * PARTICLE_SPEED_MULTIPLIER;
      particle.life -= PARTICLE_SPEED_MULTIPLIER;

      // パーティクルがリセット位置を下回ったか寿命が尽きたらリセット
      if (particle.y < PARTICLE_RESET_Y || particle.life <= 0) {
        particle.y = PARTICLE_SPAWN.Y_MAX;
        particle.x = randomInRange(PARTICLE_SPAWN.X_MIN, PARTICLE_SPAWN.X_MAX);
        particle.z = randomInRange(PARTICLE_SPAWN.Z_MIN, PARTICLE_SPAWN.Z_MAX);
        particle.life = randomInRange(PARTICLE_LIFE_MIN, PARTICLE_LIFE_MIN + PARTICLE_LIFE_VARIATION);
        particle.speedY = randomInRange(speedYRange[0], speedYRange[1]);
      }

      // 行列を直接Float32Arrayに書き込む
      positionMatrix.makeTranslation(particle.x, particle.y, particle.z);
      scaleMatrix.makeScale(particle.size, particle.size, particle.size);
      positionMatrix.multiply(scaleMatrix);
      positionMatrix.toArray(matrixArray, i * 16);
    }

    mesh.instanceMatrix.array.set(matrixArray);
    mesh.instanceMatrix.needsUpdate = true;
  });

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: particleConfig.particleColor,
        transparent: true,
        opacity: PARTICLE_OPACITY,
        side: THREE.DoubleSide,
      }),
    [particleConfig.particleColor]
  );

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[particleConfig.geometry, material, particleConfig.particleCount]}
    />
  );
};

export default ParticleLayerInstanced;
