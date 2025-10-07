import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

const FallenLeaves: React.FC = () => {
  const { season } = useSeason();
  const leavesRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    leavesRefs.current.forEach((ref, i) => {
      if (ref) {
        // 計算負荷を減らすための簡略化された動き
        ref.position.y = 8.05 + Math.sin(time * 0.5 + i) * 0.05;
        // 計算を減らすための最小限の回転
        ref.rotation.y += 0.01;
      }
    });
  });

  if (season !== "autumn") {
    return null; // 秋の間だけ葉をレンダリング
  }

  // パフォーマンスへの影響を排除するためにテクスチャなしで最小限の葉を作成
  const leaves = Array.from({ length: 2 }, (_, i) => {
    const x = (Math.random() - 0.5) * 10; // 位置のための最小限の範囲
    const z = (Math.random() - 0.5) * 10;
    return (
      <mesh
        key={i}
        ref={(el) => (leavesRefs.current[i] = el!)}
        position={[x, 8.05, z]} // 水面の少し上
        rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]} // ランダムな初期回転
        scale={[0.2, 0.2, 0.2]} // 葉のための小さなスケール
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#8B4513" // テクスチャの読み込みに失敗した場合のフォールバックカラー
          map={new THREE.TextureLoader().load(
            "../assets/AI Dried Bay Leaves.png",
            undefined,
            undefined,
            (err) => {
              console.error("Failed to load leaf texture", err);
            }
          )}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  });

  return <group>{leaves}</group>;
};

export default FallenLeaves;
