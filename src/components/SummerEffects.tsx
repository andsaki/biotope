import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

const SummerEffects: React.FC = () => {
  const { season } = useSeason();
  const heatHazeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (heatHazeRef.current) {
      const time = state.clock.getElapsedTime();
      // 陽炎エフェクト（シマー効果）
      heatHazeRef.current.material.uniforms.time.value = time;
    }
  });

  if (season !== "summer") {
    return null;
  }

  return (
    <group>
      {/* 夏の追加照明（控えめ） */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.2}
        color="#FFEB3B"
        distance={30}
      />
    </group>
  );
};

export default SummerEffects;
