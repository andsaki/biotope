import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
    let particleSizeModifier: number = 1.0; // Default size modifier

    switch (season) {
      case "spring":
        particleColor = "#FFB6C1"; // ライトピンク (花びら)
        particleCount = 15; // 50から減少
        speedYRange = [0.025, 0.05]; // アニメーションを遅くするために速度を減少
        break;
      case "summer":
        particleColor = "#98FB98"; // ペールグリーン (葉)
        particleCount = 10; // 20から減少
        speedYRange = [0.01, 0.025]; // アニメーションを遅くするために速度を減少
        particleSizeModifier = 0.5; // 夏のためにさらに小さいパーティクル
        break;
      case "autumn":
        particleColor = "#FFA500"; // オレンジ (落ち葉)
        particleCount = 5; // パフォーマンス向上のためにさらに減少
        speedYRange = [0.005, 0.015]; // 穏やかな落下のために速度を遅く
        particleSizeModifier = 1.2; // 秋の葉のために大きいパーティクル
        break;
      case "winter":
        particleColor = "#FFFFFF"; // ホワイト (雪)
        particleCount = 20; // 60から減少
        speedYRange = [0.005, 0.015]; // アニメーションを遅くするために速度を減少
        particleSizeModifier = 0.5; // 冬のためにさらに小さいパーティクル
        break;
      default:
        particleColor = "#FFB6C1";
        particleCount = 15; // 50から減少
        speedYRange = [0.025, 0.05]; // アニメーションを遅くするために速度を減少
    }

    for (let i = 0; i < particleCount; i++) {
      const baseSize = 0.03 + Math.random() * 0.07; // パーティクルサイズをわずかに減少
      const finalSize = baseSize * (particleSizeModifier || 1.0); // 存在する場合、季節のサイズ修飾子を適用
      newParticles.push({
        id: i,
        x: Math.random() * 10 - 5,
        y: Math.random() * 5,
        z: Math.random() * 5 - 2.5,
        speedX: Math.random() * 0.02 - 0.01,
        speedY:
          speedYRange[0] + Math.random() * (speedYRange[1] - speedYRange[0]),
        speedZ: Math.random() * 0.02 - 0.01,
        color: particleColor,
        size: finalSize,
        life: Math.random() * 100 + 100,
      });
    }
    setParticles(newParticles);
  }, [season]);

  const frameCount = React.useRef(0);

  useFrame(() => {
    frameCount.current++;
    // 2フレームに1回更新してパフォーマンスを向上
    if (frameCount.current % 2 !== 0) return;

    setParticles((prevParticles) =>
      prevParticles
        .map((particle) => {
          const newY = particle.y - particle.speedY * 2; // フレームスキップ分を調整
          const newX = particle.x + particle.speedX * 2;
          const newZ = particle.z + particle.speedZ * 2;
          const newLife = particle.life - 2;

          if (newY < -2 || newLife <= 0) {
            return {
              ...particle,
              y: 5,
              x: Math.random() * 10 - 5,
              z: Math.random() * 5 - 2.5,
              life: Math.random() * 100 + 100,
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
            <sphereGeometry args={[particle.size, 8, 8]} />
          ) : season === "spring" ? (
            // 桜の花びらは平たい形
            <planeGeometry args={[particle.size * 1.5, particle.size, 1]} />
          ) : season === "autumn" ? (
            // 落ち葉は平たい長方形
            <planeGeometry args={[particle.size * 1.2, particle.size * 1.8, 1]} />
          ) : (
            // 夏は小さな球体（種や小さな葉）
            <sphereGeometry args={[particle.size, 6, 6]} />
          )}
          <meshStandardMaterial
            color={particle.color}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ParticleLayer;
