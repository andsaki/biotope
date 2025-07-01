import React from "react";

const Ground: React.FC = () => {
  return (
    <group>
      {/* Ground plane to simulate the bottom of the pond, extended to fill the area */}
      <mesh position={[0, 0, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />{" "}
        {/* Large plane to fill visible area */}
        <meshStandardMaterial
          color="#5C4033" // Brownish ground color for pond bottom
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      {/* Add some irregularity to mimic natural pond bottom */}
      <mesh position={[0, 0, -1.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[2, 1, -1.95]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-1.5, -2, -1.92]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[3, -3, -1.93]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
      <mesh position={[-3, 2, -1.94]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 16]} />
        <meshStandardMaterial
          color="#4A3A2B" // Darker brown for variation
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
};

export default Ground;
