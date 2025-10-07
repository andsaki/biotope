import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WaterSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.PlaneGeometry>(null!);

  useFrame((state) => {
    if (meshRef.current && geometryRef.current) {
      const time = state.clock.getElapsedTime();
      // サイン波でy位置を調整して、より顕著な波をシミュレート
      meshRef.current.position.y = 8 + Math.sin(time * 1.5) * 0.5;

      // 光の反射に影響を与えるためにジオメトリの頂点を変更して、より顕著な波紋効果を作成
      const positions = geometryRef.current.attributes.position
        .array as Float32Array;
      const width = 80; // スケールに一致
      const height = 80; // スケールに一致
      const segments = 32; // より滑らかな波紋のための解像度を増加
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const index = (i * (segments + 1) + j) * 3 + 2; // z座標インデックス
          const x = (i / segments - 0.5) * width;
          const y = (j / segments - 0.5) * height;
          // よりダイナミックな光の反射のために振幅を増加し、波のパターンを変化
          positions[index] =
            Math.sin(x * 0.3 + time * 2.5) *
            Math.cos(y * 0.3 + time * 2.5) *
            1.2;
        }
      }
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 8, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[80, 80, 1]} // さらに広い範囲をカバーするために大幅に拡張
      receiveShadow={true} // 水面が影を受け取れるようにする
    >
      <planeGeometry ref={geometryRef} args={[1, 1, 32, 32]} />{" "}
      {/* 波紋のための解像度を増加 */}
      <meshStandardMaterial
        color="#4A90E2"
        transparent={true}
        opacity={0.3} // より明確な反射のために不透明度をさらに減少
        side={THREE.DoubleSide} // 下から見えるように両面レンダリング
        metalness={0.9} // より強い鏡のような効果のために金属性を増加
        roughness={0.1} // よりシャープで明確な反射のために粗さをさらに減少
        envMapIntensity={1.5} // より良い反射の視認性のために環境マップの強度を増加
      />
    </mesh>
  );
};

export default WaterSurface;
