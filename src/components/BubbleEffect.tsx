import React, { useRef, useMemo } from "react";
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

interface BubbleData {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
}

/**
 * 泡エフェクトコンポーネント
 * 水中から浮かび上がる泡をアニメーション
 * refベースで最適化
 */
const BubbleEffect: React.FC = () => {
  const bubbleRefs = useRef<THREE.Mesh[]>([]);
  const bubbleDataRef = useRef<BubbleData[]>([]);

  // 特定の場所から新しい泡を作成する関数
  const createBubble = (): BubbleData => {
    const size = Math.random() * (BUBBLE_SIZE_MAX - BUBBLE_SIZE_MIN) + BUBBLE_SIZE_MIN;
    const speed = Math.random() * (BUBBLE_SPEED_MAX - BUBBLE_SPEED_MIN) + BUBBLE_SPEED_MIN;
    const location = BUBBLE_LOCATIONS[Math.floor(Math.random() * BUBBLE_LOCATIONS.length)];

    return {
      x: location.x,
      y: BUBBLE_START_Y,
      z: location.z,
      size,
      speed,
    };
  };

  // 泡を初期化（一度だけ）
  useMemo(() => {
    bubbleDataRef.current = Array.from({ length: BUBBLE_COUNT }, createBubble);
  }, []);

  // 各フレームで泡の位置を更新する（refベースで高速）
  useFrame(() => {
    bubbleRefs.current.forEach((mesh, index) => {
      if (mesh && bubbleDataRef.current[index]) {
        const bubble = bubbleDataRef.current[index];
        bubble.y += bubble.speed;

        // 泡が上がりすぎた場合は底にリセット
        if (bubble.y > BUBBLE_RESET_Y_THRESHOLD) {
          const newBubble = createBubble();
          bubbleDataRef.current[index] = newBubble;
          mesh.position.set(newBubble.x, newBubble.y, newBubble.z);
        } else {
          mesh.position.y = bubble.y;
        }
      }
    });
  });

  // ジオメトリとマテリアルを共有
  const geometry = useMemo(() => new THREE.SphereGeometry(1, BUBBLE_SPHERE_WIDTH_SEGMENTS, BUBBLE_SPHERE_HEIGHT_SEGMENTS), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: BUBBLE_COLOR,
    transparent: true,
    opacity: BUBBLE_OPACITY,
  }), []);

  return (
    <group>
      {bubbleDataRef.current.map((bubble, index) => (
        <mesh
          key={index}
          ref={(el) => (bubbleRefs.current[index] = el!)}
          position={[bubble.x, bubble.y, bubble.z]}
          scale={[bubble.size, bubble.size, bubble.size]}
          geometry={geometry}
          material={material}
        />
      ))}
    </group>
  );
};

export default BubbleEffect;
