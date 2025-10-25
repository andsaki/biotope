import React from "react";

/**
 * 岩石コンポーネント
 * ビオトープ内に配置される複数の岩を表示
 */
const Rocks: React.FC = () => {
  return (
    <group>
      {/* 岩1 - 地面に配置する */}
      <mesh
        position={[-2.5, -1, -2.5]}
        rotation={[0, 0, 0]}
        scale={[1.0, 0.8, 1.2]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#808080" // 岩のための灰色にする
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* 岩2 - 地面に配置する */}
      <mesh
        position={[2.5, -1, -1.5]}
        rotation={[0, Math.PI / 6, 0]}
        scale={[0.7, 0.5, 0.9]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#696969" // やや濃い灰色にする
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      {/* 岩3 - 地面に配置する */}
      <mesh
        position={[-1.5, -1, 2.5]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[1.2, 1.0, 1.4]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#A9A9A9" // 変化のための明るい灰色にする
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      {/* 岩4 - 地面に配置する */}
      <mesh
        position={[3.5, -1, -3.5]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.9, 0.6, 1.1]}
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#778899" // 多様性のためのスレートグレーにする
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
};

export default Rocks;
