import React from "react";
import { useGLTF } from "@react-three/drei";

const KnobbedWhelk: React.FC = () => {
  return (
    <group>
      {/* Knobbed Whelk 1 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[-0.5, -1, -0.5]} // Moved closer to center
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]} // Increased scale to make slightly larger
      />
      {/* Knobbed Whelk 2 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[0.5, -1, -0.3]} // Moved closer to center
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]} // Increased scale to make slightly larger
      />
      {/* Knobbed Whelk 3 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[-0.3, -1, 0.5]} // Moved closer to center
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]} // Increased scale to make slightly larger
      />
      {/* Knobbed Whelk 4 - positioned on the ground */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[0.8, -1, -0.8]} // Moved closer to center
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]} // Increased scale to make slightly larger
      />
    </group>
  );
};

export default KnobbedWhelk;
