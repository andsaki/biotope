import React from 'react';
import { useSunPosition } from '../hooks/useSunPosition';

/**
 * 太陽の視覚表現コンポーネント
 * リアルタイムの時刻に基づいて位置が変化する発光する球体
 * @param props - コンポーネントのプロパティ
 */
export const Sun: React.FC = () => {
  const position = useSunPosition();

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
