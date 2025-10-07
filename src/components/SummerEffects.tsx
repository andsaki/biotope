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
      {/* 陽炎エフェクト */}
      <mesh ref={heatHazeRef} position={[0, 5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 15]} />
        <shaderMaterial
          transparent
          uniforms={{
            time: { value: 0 },
          }}
          vertexShader={`
            varying vec2 vUv;
            uniform float time;

            void main() {
              vUv = uv;
              vec3 pos = position;
              // 波打つ動き
              pos.z += sin(pos.x * 0.5 + time) * 0.3;
              pos.z += cos(pos.y * 0.3 + time * 0.7) * 0.2;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float time;

            void main() {
              // 陽炎の揺らぎ
              float shimmer = sin(vUv.y * 10.0 + time * 2.0) * 0.1;
              float alpha = (1.0 - vUv.y) * 0.15; // 上から下へフェード
              gl_FragColor = vec4(1.0, 1.0, 0.9, alpha + shimmer);
            }
          `}
        />
      </mesh>

      {/* 強い太陽光のグロー効果 */}
      <pointLight
        position={[0, 20, 0]}
        intensity={2.0}
        color="#FFEB3B"
        distance={40}
      />

      {/* きらめく水面用の追加ライト */}
      <pointLight
        position={[5, 10, 5]}
        intensity={1.5}
        color="#FFFFFF"
        distance={20}
      />
      <pointLight
        position={[-5, 10, 5]}
        intensity={1.5}
        color="#FFFFFF"
        distance={20}
      />
    </group>
  );
};

export default SummerEffects;
