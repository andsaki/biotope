import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 秋の落ち葉エフェクト
 * 7色の紅葉が舞い落ちるパーティクルシステム
 */
const FallenLeaves: React.FC = () => {
  const { season } = useSeason();
  const leavesRefs = useRef<THREE.Mesh[]>([]);

  // 紅葉の色バリエーション
  const leafColors = useMemo(() => [
    "#8B0000", // 深紅
    "#DC143C", // クリムゾン
    "#FF8C00", // ダークオレンジ
    "#FFD700", // ゴールド
    "#DAA520", // ゴールデンロッド
    "#B8860B", // ダークゴールデンロッド
    "#8B4513", // サドルブラウン
  ], []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    leavesRefs.current.forEach((ref, i) => {
      if (ref) {
        // 水面の揺れに合わせた動き
        ref.position.y = 8.05 + Math.sin(time * 0.5 + i) * 0.05;
        // 流れるような回転
        ref.rotation.y += 0.01;
        ref.rotation.z = Math.sin(time * 0.3 + i) * 0.1;

        // ゆっくりとした横移動（水の流れ）
        ref.position.x += Math.sin(time * 0.1 + i) * 0.005;
      }
    });
  });

  if (season !== "autumn") {
    return null; // 秋の間だけ葉をレンダリング
  }

  // 紅葉の数を増やし、色バリエーションを追加
  const leaves = Array.from({ length: 15 }, (_, i) => {
    const x = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 10;
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const scale = 0.15 + Math.random() * 0.15;

    return (
      <mesh
        key={i}
        ref={(el) => (leavesRefs.current[i] = el!)}
        position={[x, 8.05, z]}
        rotation={[-Math.PI / 2, 0, Math.random() * Math.PI * 2]}
        scale={[scale, scale, scale]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent={true}
          opacity={0.9}
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
    );
  });

  return <group>{leaves}</group>;
};

export default FallenLeaves;
