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

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // 水面と同じ波パターンで移動
      meshRef.current.position.y = 8.2 + Math.sin(time * 1.5) * 0.5;

      // 太陽/月の方向を向くように回転（影を正しく落とすため）
      const sunVector = new THREE.Vector3(sunPosition.x, sunPosition.y, sunPosition.z).normalize();
      // 棒を太陽の反対方向に傾ける（影が太陽の反対側に落ちるように）
      const angle = Math.atan2(sunVector.x, sunVector.z);
      meshRef.current.rotation.set(0, -angle, 0);
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
