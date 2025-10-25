import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * 日時計のベース（文字盤）コンポーネント
 * 時刻表示と水面の波に同期する円盤
 */
const SundialBase: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!);
  const hourTextRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // 水面と同じ波パターンでベースを移動
      groupRef.current.position.y = 8.1 + Math.sin(time * 1.5) * 0.5;
    }
    // 水波と同期する時間数字のための強化された波紋効果
    hourTextRefs.current.forEach((ref, i) => {
      if (ref) {
        const angle = i * (Math.PI / 6); // 1時間ごとに30度
        const x = 5 * Math.cos(angle);
        const z = 5 * Math.sin(angle);
        const rippleHeight =
          Math.sin(x * 0.2 + time * 1.5) * Math.cos(z * 0.2 + time * 1.5) * 0.4; // 振幅を増加し、水波の速度と同期
        ref.position.y = 0.1 + rippleHeight;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 8.1, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 0.1]}
        receiveShadow={true}
      >
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial
          color="#4682B4"
          opacity={0.4} // ベース上で影をより見えるようにするために不透明度を減少
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[...Array(12)].map((_, i) => {
        const hour = i === 0 ? 12 : i;
        const angle = i * (Math.PI / 6); // 1時間ごとに30度
        return (
          <Text
            key={i}
            ref={(el) => (hourTextRefs.current[i] = el!)}
            position={[4.5 * Math.cos(angle), 0.1, 4.5 * Math.sin(angle)]}
            rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]} // 太陽の位置に向かって数字が向き合うようにする
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {hour}
          </Text>
        );
      })}
    </group>
  );
};

export default SundialBase;
