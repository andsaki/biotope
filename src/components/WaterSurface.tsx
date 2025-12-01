import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  WATER_SURFACE_Y,
  WATER_SURFACE_Y_AMPLITUDE,
  WATER_SURFACE_Y_FREQUENCY,
  WATER_SURFACE_SCALE_X,
  WATER_SURFACE_SCALE_Y,
  WATER_SURFACE_SCALE_Z,
  WATER_SURFACE_SEGMENTS,
  WATER_WAVE_FREQUENCY,
  WATER_WAVE_TIME_SCALE,
  WATER_WAVE_AMPLITUDE,
  WATER_COLOR,
  WATER_OPACITY,
  WATER_METALNESS,
  WATER_ROUGHNESS,
  WATER_ENV_MAP_INTENSITY,
} from "../constants/waterSurface";

/**
 * 水面コンポーネント
 * 波紋アニメーションと光の反射を持つ透明な水面を表示
 */
const WaterSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geometryRef = useRef<THREE.PlaneGeometry>(null!);

  useFrame((state) => {
    if (meshRef.current && geometryRef.current) {
      const time = state.clock.getElapsedTime();
      // サイン波でy位置を調整して、より顕著な波をシミュレート
      meshRef.current.position.y = WATER_SURFACE_Y + Math.sin(time * WATER_SURFACE_Y_FREQUENCY) * WATER_SURFACE_Y_AMPLITUDE;

      // 光の反射に影響を与えるためにジオメトリの頂点を変更して、より顕著な波紋効果を作成
      const positions = geometryRef.current.attributes.position
        .array as Float32Array;
      const width = WATER_SURFACE_SCALE_X;
      const height = WATER_SURFACE_SCALE_Y;
      const segments = WATER_SURFACE_SEGMENTS;
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const index = (i * (segments + 1) + j) * 3 + 2; // z座標インデックス
          const x = (i / segments - 0.5) * width;
          const y = (j / segments - 0.5) * height;
          // よりダイナミックな光の反射のために振幅を増加し、波のパターンを変化
          positions[index] =
            Math.sin(x * WATER_WAVE_FREQUENCY + time * WATER_WAVE_TIME_SCALE) *
            Math.cos(y * WATER_WAVE_FREQUENCY + time * WATER_WAVE_TIME_SCALE) *
            WATER_WAVE_AMPLITUDE;
        }
      }
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, WATER_SURFACE_Y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[WATER_SURFACE_SCALE_X, WATER_SURFACE_SCALE_Y, WATER_SURFACE_SCALE_Z]}
      receiveShadow={true}
    >
      <planeGeometry ref={geometryRef} args={[1, 1, WATER_SURFACE_SEGMENTS, WATER_SURFACE_SEGMENTS]} />
      <meshStandardMaterial
        color={WATER_COLOR}
        transparent={true}
        opacity={WATER_OPACITY}
        side={THREE.DoubleSide}
        metalness={WATER_METALNESS}
        roughness={WATER_ROUGHNESS}
        envMapIntensity={WATER_ENV_MAP_INTENSITY}
      />
    </mesh>
  );
};

export default WaterSurface;
