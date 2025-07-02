import React from "react";

const WaterPlantsLarge: React.FC = () => {
  return (
    <group>
      {/* Water Plant 1 - positioned on the ground */}
      <mesh
        position={[-3, -1, -2]}
        rotation={[0, 0, 0]}
        scale={[0.3, 2.0, 0.3]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial
          color="#1B5E20" // Darker green for distinction
        />{" "}
        {/* Fallback to simple geometry */}
      </mesh>
      {/* Water Plant 2 - positioned on the ground */}
      <mesh
        position={[2, -1, -1]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 1.8, 0.25]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial
          color="#1B5E20" // Darker green for distinction
        />
      </mesh>
      {/* Water Plant 3 - positioned on the ground */}
      <mesh
        position={[-2, -1, 2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 2.2, 0.35]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial
          color="#1B5E20" // Darker green for distinction
        />
      </mesh>
      {/* Water Plant 4 - positioned on the ground */}
      <mesh
        position={[3, -1, -3]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 1.5, 0.2]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial
          color="#1B5E20" // Darker green for distinction
        />
      </mesh>
    </group>
  );
};

export default WaterPlantsLarge;
