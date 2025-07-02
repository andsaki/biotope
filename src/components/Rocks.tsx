import React from "react";

const Rocks: React.FC = () => {
  return (
    <group>
      {/* Rock 1 - positioned on the ground */}
      <mesh
        position={[-2.5, -1, -2.5]}
        rotation={[0, 0, 0]}
        scale={[1.0, 0.8, 1.2]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#808080" // Gray color for rock
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Rock 2 - positioned on the ground */}
      <mesh
        position={[2.5, -1, -1.5]}
        rotation={[0, Math.PI / 6, 0]}
        scale={[0.7, 0.5, 0.9]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#696969" // Slightly darker gray
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      {/* Rock 3 - positioned on the ground */}
      <mesh
        position={[-1.5, -1, 2.5]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[1.2, 1.0, 1.4]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#A9A9A9" // Lighter gray for variation
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      {/* Rock 4 - positioned on the ground */}
      <mesh
        position={[3.5, -1, -3.5]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.9, 0.6, 1.1]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#778899" // Slate gray for diversity
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
};

export default Rocks;
