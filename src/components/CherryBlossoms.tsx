import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

const CherryBlossoms: React.FC = () => {
  const { season } = useSeason();
  const particlesRef = useRef<THREE.Points>(null);

  // 花びらのパーティクル生成
  const particles = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const rotations = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 初期位置（上空からランダムに）
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 10 + Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      // 落下速度（ゆっくり）
      velocities[i * 3] = (Math.random() - 0.5) * 0.2; // X方向のドリフト
      velocities[i * 3 + 1] = -0.05 - Math.random() * 0.05; // Y方向（下向き）
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2; // Z方向のドリフト

      // 回転
      rotations[i] = Math.random() * Math.PI * 2;
    }

    return { positions, velocities, rotations };
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      // 位置の更新
      positions[i * 3] += particles.velocities[i * 3] * delta * 60;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta * 60;
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta * 60;

      // ふわふわとした動きを追加
      positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.5) * 0.01;

      // 地面に達したらリセット
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // 回転
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  if (season !== "spring") {
    return null;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#FFB7D5" // 淡いピンク色
        transparent
        opacity={0.8}
        sizeAttenuation
        map={createPetalTexture()}
        alphaTest={0.5}
      />
    </points>
  );
};

// 花びらのテクスチャ生成
function createPetalTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // グラデーション
    const gradient = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 200, 220, 1)");
    gradient.addColorStop(0.5, "rgba(255, 183, 213, 0.8)");
    gradient.addColorStop(1, "rgba(255, 183, 213, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default CherryBlossoms;
