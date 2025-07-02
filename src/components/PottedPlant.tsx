import React from "react";
import { useGLTF } from "@react-three/drei";

const PottedPlant: React.FC = () => {
  return (
    <group>
      {/* Potted Plant 1 - positioned further away on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-6, -1, -5]}
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 2 - positioned further away on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[6, -1, -4]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 3 - positioned further away on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-5, -1, 5]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 4 - positioned further away on the ground */}
      <primitive
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[7, -1, -6]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]}
        castShadow={true}
        receiveShadow={true}
      />
    </group>
  );
};

export default PottedPlant;
