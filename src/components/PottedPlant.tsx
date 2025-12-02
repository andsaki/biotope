import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useModelScene } from "../hooks/useModelScene";

/**
 * 鉢植え植物コンポーネント
 * 風に揺れる複数の鉢植え植物を配置
 */
const PottedPlant: React.FC = () => {
  const plantRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // 各植物にわずかな揺れを追加し、微妙な変化をつける
    if (plantRef.current) {
      plantRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
  });

  const scene = useModelScene("pottedPlant");

  return (
    <primitive
      ref={plantRef}
      object={scene}
      position={[-6, -1, -5]}
      rotation={[0, 0, 0]}
      scale={[0.3, 0.3, 0.3]}
      castShadow={true}
      receiveShadow={true}
    />
  );
};

export default PottedPlant;
