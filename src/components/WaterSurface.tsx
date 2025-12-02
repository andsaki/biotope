import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
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

  // マテリアルをメモ化してパフォーマンス向上
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: WATER_COLOR,
        transparent: true,
        opacity: WATER_OPACITY,
        side: THREE.DoubleSide,
        metalness: WATER_METALNESS,
        roughness: WATER_ROUGHNESS,
        envMapIntensity: WATER_ENV_MAP_INTENSITY,
      }),
    []
  );

  useThrottledFrame((state) => {
    if (!meshRef.current || !geometryRef.current) return;

    const time = state.clock.getElapsedTime();
    meshRef.current.position.y =
      WATER_SURFACE_Y + Math.sin(time * WATER_SURFACE_Y_FREQUENCY) * WATER_SURFACE_Y_AMPLITUDE;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const width = WATER_SURFACE_SCALE_X;
    const height = WATER_SURFACE_SCALE_Y;
    const segments = WATER_SURFACE_SEGMENTS;
    const timeScale = time * WATER_WAVE_TIME_SCALE;

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments - 0.5) * width;
      const sinX = Math.sin(x * WATER_WAVE_FREQUENCY + timeScale);

      for (let j = 0; j <= segments; j++) {
        const index = (i * (segments + 1) + j) * 3 + 2;
        const y = (j / segments - 0.5) * height;
        positions[index] =
          sinX * Math.cos(y * WATER_WAVE_FREQUENCY + timeScale) * WATER_WAVE_AMPLITUDE;
      }
    }
    geometryRef.current.attributes.position.needsUpdate = true;
  }, 30);

  return (
    <mesh
      ref={meshRef}
      position={[0, WATER_SURFACE_Y, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[WATER_SURFACE_SCALE_X, WATER_SURFACE_SCALE_Y, WATER_SURFACE_SCALE_Z]}
      receiveShadow={true}
    >
      <planeGeometry ref={geometryRef} args={[1, 1, WATER_SURFACE_SEGMENTS, WATER_SURFACE_SEGMENTS]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default WaterSurface;
