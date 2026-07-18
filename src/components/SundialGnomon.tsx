import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSunPosition } from "../hooks/useSunPosition";

/**
 * 日時計のノモン（影を作る棒）コンポーネント
 * 水面の波と同期して上下に動き、太陽/月の位置に応じて影を落とす
 */
const SundialGnomon: React.FC = () => {
  const shadowLineRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const sunVectorRef = useRef(new THREE.Vector3());
  const sunPosition = useSunPosition();

  useEffect(() => {
    sunVectorRef.current.set(sunPosition.x, sunPosition.y, sunPosition.z);
  }, [sunPosition]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const waveY = 8.2 + Math.sin(time * 1.5) * 0.5;

    if (groupRef.current) {
      // グループ全体を波と同期させる
      groupRef.current.position.y = waveY;
    }

    if (shadowLineRef.current) {
      // 太陽/月の位置から影の方向を計算
      const sunVector = sunVectorRef.current;
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
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[0.5, 2, 0.5]}
        castShadow={true}
      >
        <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
        <meshStandardMaterial
          color="#1f3341"
          roughness={0.92}
          metalness={0}
        />
      </mesh>

      {/* 影のマーカー（線） */}
      <mesh
        ref={shadowLineRef}
        position={[0, -0.98, 0]}
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[0.15, 0.05, 2.5]} />
        <meshStandardMaterial
          color="#06111b"
          transparent={true}
          opacity={0.5}
          emissive="#071724"
          emissiveIntensity={0.12}
        />
      </mesh>
    </group>
  );
};

export default SundialGnomon;
