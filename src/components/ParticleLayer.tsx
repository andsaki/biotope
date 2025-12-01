import React, { useEffect, useState } from "react";
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
 * パーティクルレイヤーコンポーネント
 * 季節に応じたパーティクルエフェクトを表示
 */
const ParticleLayer: React.FC = () => {
  const { season } = useSeason();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 季節に基づいてパーティクルを初期化
    const newParticles: Particle[] = [];
    let particleColor: string;
    let particleCount: number;
    let speedYRange: [number, number];
    let particleSizeModifier: number;

    switch (season) {
      case "spring":
        particleColor = PARTICLE_COLOR.SPRING;
        particleCount = PARTICLE_COUNT.SPRING;
        speedYRange = PARTICLE_SPEED_Y.SPRING;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.SPRING;
        break;
      case "summer":
        particleColor = PARTICLE_COLOR.SUMMER;
        particleCount = PARTICLE_COUNT.SUMMER;
        speedYRange = PARTICLE_SPEED_Y.SUMMER;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.SUMMER;
        break;
      case "autumn":
        particleColor = PARTICLE_COLOR.AUTUMN;
        particleCount = PARTICLE_COUNT.AUTUMN;
        speedYRange = PARTICLE_SPEED_Y.AUTUMN;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.AUTUMN;
        break;
      case "winter":
        particleColor = PARTICLE_COLOR.WINTER;
        particleCount = PARTICLE_COUNT.WINTER;
        speedYRange = PARTICLE_SPEED_Y.WINTER;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.WINTER;
        break;
      default:
        particleColor = PARTICLE_COLOR.DEFAULT;
        particleCount = PARTICLE_COUNT.DEFAULT;
        speedYRange = PARTICLE_SPEED_Y.DEFAULT;
        particleSizeModifier = PARTICLE_SIZE_MODIFIER.DEFAULT;
    }

    for (let i = 0; i < particleCount; i++) {
      const baseSize = PARTICLE_BASE_SIZE_MIN + Math.random() * PARTICLE_BASE_SIZE_VARIATION;
      const finalSize = baseSize * particleSizeModifier;
      newParticles.push({
        id: i,
        x: Math.random() * (PARTICLE_SPAWN.X_MAX - PARTICLE_SPAWN.X_MIN) + PARTICLE_SPAWN.X_MIN,
        y: Math.random() * PARTICLE_SPAWN.Y_MAX,
        z: Math.random() * (PARTICLE_SPAWN.Z_MAX - PARTICLE_SPAWN.Z_MIN) + PARTICLE_SPAWN.Z_MIN,
        speedX: Math.random() * (PARTICLE_SPEED_X_MAX - PARTICLE_SPEED_X_MIN) + PARTICLE_SPEED_X_MIN,
        speedY: speedYRange[0] + Math.random() * (speedYRange[1] - speedYRange[0]),
        speedZ: Math.random() * (PARTICLE_SPEED_Z_MAX - PARTICLE_SPEED_Z_MIN) + PARTICLE_SPEED_Z_MIN,
        color: particleColor,
        size: finalSize,
        life: Math.random() * PARTICLE_LIFE_VARIATION + PARTICLE_LIFE_MIN,
      });
    }
    setParticles(newParticles);
  }, [season]);

  const frameCount = React.useRef(0);

  useFrame(() => {
    frameCount.current++;
    // パフォーマンス向上のためフレームスキップ
    if (frameCount.current % PARTICLE_FRAME_SKIP !== 0) return;

    setParticles((prevParticles) =>
      prevParticles
        .map((particle) => {
          const newY = particle.y - particle.speedY * PARTICLE_SPEED_MULTIPLIER;
          const newX = particle.x + particle.speedX * PARTICLE_SPEED_MULTIPLIER;
          const newZ = particle.z + particle.speedZ * PARTICLE_SPEED_MULTIPLIER;
          const newLife = particle.life - PARTICLE_SPEED_MULTIPLIER;

          if (newY < PARTICLE_RESET_Y || newLife <= 0) {
            return {
              ...particle,
              y: PARTICLE_SPAWN.Y_MAX,
              x: Math.random() * (PARTICLE_SPAWN.X_MAX - PARTICLE_SPAWN.X_MIN) + PARTICLE_SPAWN.X_MIN,
              z: Math.random() * (PARTICLE_SPAWN.Z_MAX - PARTICLE_SPAWN.Z_MIN) + PARTICLE_SPAWN.Z_MIN,
              life: Math.random() * PARTICLE_LIFE_VARIATION + PARTICLE_LIFE_MIN,
            };
          }
          return { ...particle, y: newY, x: newX, z: newZ, life: newLife };
        })
        .filter((particle) => particle.life > 0)
    );
  });

  return (
    <group>
      {particles.map((particle) => (
        <mesh key={particle.id} position={[particle.x, particle.y, particle.z]}>
          {season === "winter" ? (
            // 雪は球体
            <sphereGeometry args={[particle.size, PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS, PARTICLE_GEOMETRY_SIZE.WINTER_SEGMENTS]} />
          ) : season === "spring" ? (
            // 桜の花びらは平たい形
            <planeGeometry args={[particle.size * PARTICLE_GEOMETRY_SIZE.SPRING_WIDTH, particle.size * PARTICLE_GEOMETRY_SIZE.SPRING_HEIGHT, 1]} />
          ) : season === "autumn" ? (
            // 落ち葉は平たい長方形
            <planeGeometry args={[particle.size * PARTICLE_GEOMETRY_SIZE.AUTUMN_WIDTH, particle.size * PARTICLE_GEOMETRY_SIZE.AUTUMN_HEIGHT, 1]} />
          ) : (
            // 夏は小さな球体（種や小さな葉）
            <sphereGeometry args={[particle.size, PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS, PARTICLE_GEOMETRY_SIZE.SUMMER_SEGMENTS]} />
          )}
          <meshStandardMaterial
            color={particle.color}
            transparent={true}
            opacity={PARTICLE_OPACITY}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ParticleLayer;
