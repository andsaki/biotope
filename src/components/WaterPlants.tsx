import React from "react";
import { useGLTF } from "@react-three/drei";

const WaterPlants: React.FC = () => {
  return (
    <group>
      {/* Water Plant 1 - using Potted Plant 1 model */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-2, -1, -1]}
        rotation={[0, 0, 0]}
        scale={[0.1, 0.1, 0.1]} // Further reduced scale to make even smaller
      />
      {/* Water Plant 2 - using Potted Plant 1 model */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[1, -1, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.075, 0.075, 0.075]} // Further reduced scale to make even smaller
      />
      {/* Water Plant 3 - using Potted Plant 1 model */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-1, -1, 1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.125, 0.125, 0.125]} // Further reduced scale to make even smaller
      />
      {/* Water Plant 4 - using Potted Plant 1 model */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[2, -1, -2]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.05, 0.05, 0.05]} // Further reduced scale to make even smaller
      />
    </group>
  );
};

export default WaterPlants;
