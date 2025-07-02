import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PottedPlant: React.FC = () => {
  const plant1Ref = useRef<THREE.Group>(null!);
  const plant2Ref = useRef<THREE.Group>(null!);
  const plant3Ref = useRef<THREE.Group>(null!);
  const plant4Ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Add subtle swaying motion to each plant with slight variations
    if (plant1Ref.current) {
      plant1Ref.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
    if (plant2Ref.current) {
      plant2Ref.current.rotation.z = Math.sin(time * 0.6 + 1) * 0.04;
    }
    if (plant3Ref.current) {
      plant3Ref.current.rotation.z = Math.sin(time * 0.4 + 2) * 0.06;
    }
    if (plant4Ref.current) {
      plant4Ref.current.rotation.z = Math.sin(time * 0.7 + 3) * 0.03;
    }
  });

  return (
    <group>
      {/* Potted Plant 1 - positioned further away on the ground */}
      <primitive
        ref={plant1Ref}
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-6, -1, -5]}
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 2 - positioned further away on the ground */}
      <primitive
        ref={plant2Ref}
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[6, -1, -4]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 3 - positioned further away on the ground */}
      <primitive
        ref={plant3Ref}
        object={useGLTF("/assets/Potted Plant 1/scene.gltf").scene}
        position={[-5, -1, 5]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* Potted Plant 4 - positioned further away on the ground */}
      <primitive
        ref={plant4Ref}
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
