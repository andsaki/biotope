import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointMaterial } from "@react-three/drei";
import { useDayPeriod } from "../contexts/TimeContext";
import {
  STAR_COUNT,
  STAR_POSITION_RANGE,
  STAR_HUE,
  STAR_SATURATION,
  STAR_LIGHTNESS_MIN,
  STAR_LIGHTNESS_MAX,
  STAR_SIZE_MIN,
  STAR_SIZE_MAX,
  STAR_ROTATION_SPEED,
  STAR_DISPLAY_DELAY,
  STAR_FADE_SPEED,
  STAR_MATERIAL,
} from "../constants/stars";

/**
 * 星空コンポーネント
 * 夜間に表示される星のパーティクルシステム
 */
const Stars: React.FC = () => {
  const isNight = !useDayPeriod();
  const meshRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNight) {
      timer = setTimeout(() => setVisible(true), STAR_DISPLAY_DELAY);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isNight]);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = [];
    const colors = [];
    const sizes = [];
    const color = new THREE.Color();

    for (let i = 0; i < STAR_COUNT; i++) {
      const x = (Math.random() - 0.5) * STAR_POSITION_RANGE;
      const y = (Math.random() - 0.5) * STAR_POSITION_RANGE;
      const z = (Math.random() - 0.5) * STAR_POSITION_RANGE;
      positions.push(x, y, z);

      color.setHSL(STAR_HUE, STAR_SATURATION, Math.random() * (STAR_LIGHTNESS_MAX - STAR_LIGHTNESS_MIN) + STAR_LIGHTNESS_MIN);
      colors.push(color.r, color.g, color.b);

      sizes.push(Math.random() * (STAR_SIZE_MAX - STAR_SIZE_MIN) + STAR_SIZE_MIN);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
    };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * STAR_ROTATION_SPEED;
    }
    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        visible ? 1 : 0,
        STAR_FADE_SPEED
      );
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <PointMaterial
        ref={materialRef}
        transparent
        vertexColors
        size={STAR_MATERIAL.size}
        sizeAttenuation={STAR_MATERIAL.sizeAttenuation}
        depthWrite={STAR_MATERIAL.depthWrite}
        fog={STAR_MATERIAL.fog}
        opacity={0}
      />
    </points>
  );
};

export default Stars;
