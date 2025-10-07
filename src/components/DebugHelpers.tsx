import React from 'react';
import { Text } from '@react-three/drei';

interface DebugHelpersProps {
  enabled?: boolean;
}

/**
 * デバッグ用のヘルパー表示コンポーネント
 * （バウンディングボックス、軸、座標ラベル）
 */
export const DebugHelpers: React.FC<DebugHelpersProps> = ({ enabled = true }) => {
  if (!enabled) return null;

  return (
    <>
      {/* バウンディングボックス */}
      <mesh position={[0, 4, 0.5]} scale={[12, 8, 5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#FFFFFF" wireframe={true} />
      </mesh>

      {/* 座標軸ヘルパー */}
      <axesHelper args={[5]} />

      {/* 軸ラベル */}
      <Text
        position={[5.2, 0, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="red"
        anchorX="left"
        anchorY="middle"
      >
        X
      </Text>
      <Text
        position={[0, 5.2, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="green"
        anchorX="center"
        anchorY="bottom"
      >
        Y
      </Text>
      <Text
        position={[0, 0, 5.2]}
        rotation={[0, 0, 0]}
        fontSize={0.5}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        Z
      </Text>
    </>
  );
};
