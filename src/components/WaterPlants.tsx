import React from "react";

const WaterPlants: React.FC = () => {
  return (
    <group>
      {/* Water Plant 1 - positioned on the ground */}
      <mesh
        position={[-2, -1, -1]}
        rotation={[0, 0, 0]}
        scale={[0.2, 1.5, 0.2]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color="#228B22" />{" "}
        {/* ForestGreen for plant color */}
      </mesh>
      {/* Water Plant 2 - positioned on the ground */}
      <mesh position={[1, -1, 0]} rotation={[0, 0, 0]} scale={[0.2, 1.2, 0.2]}>
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      {/* Water Plant 3 - positioned on the ground */}
      <mesh position={[-1, -1, 1]} rotation={[0, 0, 0]} scale={[0.2, 1.8, 0.2]}>
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      {/* Water Plant 4 - positioned on the ground */}
      <mesh position={[2, -1, -2]} rotation={[0, 0, 0]} scale={[0.2, 1.0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
};

export default WaterPlants;
