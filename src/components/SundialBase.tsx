import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import {
  SUNDIAL_BASE_Y,
  SUNDIAL_WAVE_AMPLITUDE,
  SUNDIAL_WAVE_FREQUENCY,
  SUNDIAL_SCALE,
  SUNDIAL_THICKNESS,
  SUNDIAL_CIRCLE_RADIUS,
  SUNDIAL_CIRCLE_SEGMENTS,
  SUNDIAL_COLOR,
  SUNDIAL_OPACITY,
  SUNDIAL_HOUR_COUNT,
  SUNDIAL_HOUR_RADIUS,
  SUNDIAL_HOUR_Y_OFFSET,
  SUNDIAL_TEXT_SIZE,
  SUNDIAL_TEXT_COLOR,
  SUNDIAL_TEXT_WAVE_FREQUENCY,
  SUNDIAL_TEXT_WAVE_TIME_SCALE,
  SUNDIAL_TEXT_WAVE_AMPLITUDE,
} from "../constants/sundial";

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
      groupRef.current.position.y = SUNDIAL_BASE_Y + Math.sin(time * SUNDIAL_WAVE_FREQUENCY) * SUNDIAL_WAVE_AMPLITUDE;
    }
    // 水波と同期する時間数字のための強化された波紋効果
    hourTextRefs.current.forEach((ref, i) => {
      if (ref) {
        const angle = i * (Math.PI / SUNDIAL_HOUR_COUNT / 2);
        const x = SUNDIAL_HOUR_RADIUS * Math.cos(angle);
        const z = SUNDIAL_HOUR_RADIUS * Math.sin(angle);
        const rippleHeight =
          Math.sin(x * SUNDIAL_TEXT_WAVE_FREQUENCY + time * SUNDIAL_TEXT_WAVE_TIME_SCALE) * Math.cos(z * SUNDIAL_TEXT_WAVE_FREQUENCY + time * SUNDIAL_TEXT_WAVE_TIME_SCALE) * SUNDIAL_TEXT_WAVE_AMPLITUDE;
        ref.position.y = SUNDIAL_HOUR_Y_OFFSET + rippleHeight;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, SUNDIAL_BASE_Y, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[SUNDIAL_SCALE, SUNDIAL_SCALE, SUNDIAL_THICKNESS]}
        receiveShadow={true}
      >
        <circleGeometry args={[SUNDIAL_CIRCLE_RADIUS, SUNDIAL_CIRCLE_SEGMENTS]} />
        <meshStandardMaterial
          color={SUNDIAL_COLOR}
          opacity={SUNDIAL_OPACITY}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[...Array(SUNDIAL_HOUR_COUNT)].map((_, i) => {
        const hour = i === 0 ? SUNDIAL_HOUR_COUNT : i;
        const angle = i * (Math.PI / SUNDIAL_HOUR_COUNT / 2);
        return (
          <Text
            key={i}
            ref={(el) => (hourTextRefs.current[i] = el!)}
            position={[SUNDIAL_HOUR_RADIUS * Math.cos(angle), SUNDIAL_HOUR_Y_OFFSET, SUNDIAL_HOUR_RADIUS * Math.sin(angle)]}
            rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]}
            fontSize={SUNDIAL_TEXT_SIZE}
            color={SUNDIAL_TEXT_COLOR}
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
