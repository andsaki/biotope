import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

const SnowEffect: React.FC = () => {
  const { season } = useSeason();
  const snowRef = useRef<THREE.Points>(null);

  // 雪のパーティクル生成
  const snowParticles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 初期位置
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 20 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // 落下速度
      velocities[i * 3] = (Math.random() - 0.5) * 0.1; // X方向のドリフト
      velocities[i * 3 + 1] = -(0.1 + Math.random() * 0.1); // Y方向（下向き）
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // Z方向のドリフト
    }

    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!snowRef.current) return;

    const positions = snowRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      // 位置の更新
      positions[i * 3] += snowParticles.velocities[i * 3] * delta * 60;
      positions[i * 3 + 1] += snowParticles.velocities[i * 3 + 1] * delta * 60;
      positions[i * 3 + 2] += snowParticles.velocities[i * 3 + 2] * delta * 60;

      // ふわふわとした動き（風の影響）
      positions[i * 3] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * 0.02;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 0.3 + i * 0.1) * 0.02;

      // 地面に達したらリセット
      if (positions[i * 3 + 1] < -1) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = 20 + Math.random() * 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    }

    snowRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (season !== "winter") {
    return null;
  }

  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={snowParticles.positions.length / 3}
          array={snowParticles.positions}
          itemSize={3}
          args={[snowParticles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#FFFFFF"
        transparent
        opacity={0.8}
        sizeAttenuation
        map={createSnowflakeTexture()}
        alphaTest={0.5}
      />
    </points>
  );
};

// 雪の結晶テクスチャ生成
function createSnowflakeTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // グラデーション
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default SnowEffect;
