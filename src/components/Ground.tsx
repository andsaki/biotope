import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const Ground: React.FC = () => {
  const { scene } = useThree();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Texture loading removed to use solid color

  return (
    <group>
      {/* Ground plane to simulate the bottom of the pond, extended much further, positioned at slightly negative Y */}
      <mesh position={[0, -1, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80, 4, 4]} />{" "}
        {/* Reduced subdivisions for better performance */}
        <meshStandardMaterial
          color="#8B4513" // Changed to a darker brown color (SaddleBrown)
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
};

export default Ground;
