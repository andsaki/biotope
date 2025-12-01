import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  BUBBLE_COUNT,
  BUBBLE_SIZE_MIN,
  BUBBLE_SIZE_MAX,
  BUBBLE_SPEED_MIN,
  BUBBLE_SPEED_MAX,
  BUBBLE_RESET_Y_THRESHOLD,
  BUBBLE_START_Y,
  BUBBLE_LOCATIONS,
  BUBBLE_SPHERE_WIDTH_SEGMENTS,
  BUBBLE_SPHERE_HEIGHT_SEGMENTS,
  BUBBLE_COLOR,
  BUBBLE_OPACITY,
} from "../constants/bubbleEffect";

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
    const size = Math.random() * (BUBBLE_SIZE_MAX - BUBBLE_SIZE_MIN) + BUBBLE_SIZE_MIN;
    const speed = Math.random() * (BUBBLE_SPEED_MAX - BUBBLE_SPEED_MIN) + BUBBLE_SPEED_MIN;
    // 場所からランダムに1つを選択する
    const location = BUBBLE_LOCATIONS[Math.floor(Math.random() * BUBBLE_LOCATIONS.length)];

    return {
      id: Math.random(), // キー用のユニークIDにする
      x: location.x,
      y: BUBBLE_START_Y,
      z: location.z,
      size,
      speed,
    };
  };

  // 泡を初期化する
  useEffect(() => {
    const initialBubbles = Array.from({ length: BUBBLE_COUNT }, createBubble);
    setBubbleData(initialBubbles);
  }, []);

  // 各フレームで泡の位置を更新する
  useFrame(() => {
    if (bubbleGroup.current) {
      setBubbleData((prevData) =>
        prevData.map((bubble) => {
          const newY = bubble.y + bubble.speed;
          // 泡が上がりすぎた場合は底にリセットする
          if (newY > BUBBLE_RESET_Y_THRESHOLD) {
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
      <sphereGeometry args={[1, BUBBLE_SPHERE_WIDTH_SEGMENTS, BUBBLE_SPHERE_HEIGHT_SEGMENTS]} />
      <meshStandardMaterial
        color={BUBBLE_COLOR}
        transparent={true}
        opacity={BUBBLE_OPACITY}
      />
    </mesh>
  ));

  return <group ref={bubbleGroup}>{bubbles}</group>;
};

export default BubbleEffect;
