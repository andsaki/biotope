import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 泡エフェクトコンポーネント
 * 水中から浮かび上がる泡をアニメーション
 */
const BubbleEffect: React.FC = () => {
  const [bubbleData, setBubbleData] = useState<
    {
      id: number;
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
    }[]
  >([]);
  const bubbleGroup = useRef<THREE.Group>(null!);

  // 特定の場所から新しい泡を作成する関数
  const createBubble = () => {
    const size = Math.random() * 0.03 + 0.01; // さらに小さい泡のためにサイズ範囲を減らす (0.01から0.04)
    const speed = Math.random() * 0.08 + 0.03; // より速く上昇する泡のために速度範囲を増やす
    // バウンドボックスの外側にある可能性のある、泡の放出のための10の特定の場所を定義する
    const locations = [
      { x: -3.0, z: -3.0 }, // 場所1
      { x: 3.0, z: 0.0 }, // 場所2
      { x: -2.0, z: 3.0 }, // 場所3
      { x: -1.5, z: -2.0 }, // 場所4
      { x: 2.0, z: -1.5 }, // 場所5
      { x: -2.5, z: 1.5 }, // 場所6
      { x: 1.5, z: 2.0 }, // 場所7
      { x: -1.0, z: -1.0 }, // 場所8
      { x: 1.0, z: 1.0 }, // 場所9
      { x: 0.0, z: -2.5 }, // 場所10
    ];
    // 場所からランダムに1つを選択する
    const location = locations[Math.floor(Math.random() * locations.length)];

    return {
      id: Math.random(), // キー用のユニークIDにする
      x: location.x,
      y: -1, // 地面レベルから開始する
      z: location.z,
      size,
      speed,
    };
  };

  // 泡を初期化する
  useEffect(() => {
    const initialBubbles = Array.from({ length: 50 }, createBubble); // より多くの場所を考慮して泡の数を増やす
    setBubbleData(initialBubbles);
  }, []);

  // 各フレームで泡の位置を更新する
  useFrame(() => {
    if (bubbleGroup.current) {
      setBubbleData((prevData) =>
        prevData.map((bubble) => {
          const newY = bubble.y + bubble.speed;
          // 泡が上がりすぎた場合は底にリセットする
          if (newY > 8) {
            return createBubble();
          }
          return { ...bubble, y: newY };
        })
      );
    }
  });

  // データに基づいて泡をレンダリングする
  const bubbles = bubbleData.map((bubble) => (
    <mesh
      key={bubble.id}
      position={[bubble.x, bubble.y, bubble.z]}
      scale={[bubble.size, bubble.size, bubble.size]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ADD8E6" // 泡の色のためのライトブルーにする
        transparent={true}
        opacity={0.8} // 視認性を向上させるために不透明度を増やす
      />
    </mesh>
  ));

  return <group ref={bubbleGroup}>{bubbles}</group>;
};

export default BubbleEffect;
