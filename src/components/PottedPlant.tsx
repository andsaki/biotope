import React from "react";
import { useGLTF } from "@react-three/drei";

const PottedPlant: React.FC = () => {
  return (
    <group>
      {/* Potted Plant 1 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-4, -1, -3]}
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]}
      />
      {/* Potted Plant 2 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[4, -1, -2]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]}
      />
      {/* Potted Plant 3 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-3, -1, 3]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]}
      />
      {/* Potted Plant 4 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[5, -1, -4]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]}
      />
    </group>
  );
};

export default PottedPlant;
