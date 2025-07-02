import React from "react";
import { useGLTF } from "@react-three/drei";

const WaterPlants: React.FC = () => {
  return (
    <group>
      {/* 水草1 - Potted Plant 1モデルを使用する */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-2, -1, -1]}
        rotation={[0, 0, 0]}
        scale={[0.1, 0.1, 0.1]} // さらに小さくするためにスケールを減らす
      />
      {/* 水草2 - Potted Plant 1モデルを使用する */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[1, -1, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.075, 0.075, 0.075]} // さらに小さくするためにスケールを減少
      />
      {/* 水草3 - Potted Plant 1モデルを使用する */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-1, -1, 1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.125, 0.125, 0.125]} // さらに小さくするためにスケールを減少
      />
      {/* 水草4 - Potted Plant 1モデルを使用する */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[2, -1, -2]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.05, 0.05, 0.05]} // さらに小さくするためにスケールを減少
      />
    </group>
  );
};

export default WaterPlants;
