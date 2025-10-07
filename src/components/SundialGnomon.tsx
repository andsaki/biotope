import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 水波と一緒に動く日時計ノモンコンポーネント
const SundialGnomon: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // 水面と同じ波パターンで移動
      meshRef.current.position.y = 8.2 + Math.sin(time * 1.5) * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 8.2, 0]}
      rotation={[0, 0, 0]}
      scale={[0.5, 2, 0.5]}
      castShadow={true}
    >
      <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
      <meshStandardMaterial color="#8B4513" />{" "}
      {/* 木のような外観のための茶色がかった色 */}
    </mesh>
  );
};

export default SundialGnomon;
