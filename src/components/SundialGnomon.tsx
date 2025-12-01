import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SunPosition } from "../utils/sunPosition";

interface SundialGnomonProps {
  /** 太陽の位置 */
  sunPosition: SunPosition;
}

/**
 * 日時計のノモン（影を作る棒）コンポーネント
 * 水面の波と同期して上下に動き、太陽/月の位置に応じて影を落とす
 */
const SundialGnomon: React.FC<SundialGnomonProps> = ({ sunPosition }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const shadowLineRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const waveY = 8.2 + Math.sin(time * 1.5) * 0.5;

    if (groupRef.current) {
      // グループ全体を波と同期させる
      groupRef.current.position.y = waveY;
    }

    if (shadowLineRef.current) {
      // 太陽/月の位置から影の方向を計算
      const sunVector = new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z);
      // 影の角度（太陽の反対方向）
      const angle = Math.atan2(-sunVector.x, -sunVector.z);

      // 影の線を回転
      shadowLineRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={groupRef} position={[0, 8.2, 0]}>
      {/* 日時計の棒 */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[0.5, 2, 0.5]}
        castShadow={true}
      >
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 影のマーカー（線） */}
      <mesh
        ref={shadowLineRef}
        position={[0, -0.98, 0]}
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.15, 0.05, 2.5]} />
        <meshStandardMaterial
          color="#1a1a1a"
          transparent={true}
          opacity={0.8}
          emissive="#1a1a1a"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

export default SundialGnomon;
