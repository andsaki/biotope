import React from "react";

/**
 * ビオトープの地面コンポーネント
 * 池の底をシミュレートする茶色の平面を表示
 */
const Ground: React.FC = () => {
  return (
    <group>
      {/* 池の底をシミュレートする地面平面、大幅に拡張され、わずかに負のYに配置 */}
      <mesh
        position={[0, -1, -2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={true}
      >
        <planeGeometry args={[80, 80, 4, 4]} />{" "}
        {/* パフォーマンス向上のために分割数を減らす */}
        <meshStandardMaterial
          color="#8B4513" // より濃い茶色に変更（サドルブラウン）
          transparent={false}
          opacity={1.0}
        />
      </mesh>
    </group>
  );
};

export default React.memo(Ground);
