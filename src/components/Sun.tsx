import React from 'react';
import type { SunPosition } from '../utils/sunPosition';

interface SunProps {
  position: SunPosition;
}

/**
 * 太陽の視覚表現コンポーネント
 */
export const Sun: React.FC<SunProps> = ({ position }) => {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={5.0}
      />
    </mesh>
  );
};
