import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointMaterial } from "@react-three/drei";
import { useDayPeriod } from "../contexts/TimeContext";
import {
  REFLECTED_STAR_COUNT,
  STAR_DISPLAY_DELAY,
  STAR_FADE_SPEED,
  STAR_MATERIAL,
  REFLECTED_STAR_POSITION_Y,
  REFLECTED_STAR_SPREAD_X,
  REFLECTED_STAR_SPREAD_Z,
  REFLECTED_STAR_WAVE_FREQUENCY,
  REFLECTED_STAR_WAVE_AMPLITUDE,
  REFLECTED_STAR_COLOR,
  REFLECTED_STAR_OPACITY,
} from "../constants/stars";

/**
 * 水面に反射する星空コンポーネント
 * 夜間に水面下に表示される星の反射
 */
const ReflectedStars: React.FC = () => {
  const isNight = !useDayPeriod();
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const [visible, setVisible] = useState(false);
  const frameCount = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNight) {
      timer = setTimeout(() => setVisible(true), STAR_DISPLAY_DELAY);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isNight]);

  const particles = useMemo(() => {
    const positions = new Float32Array(REFLECTED_STAR_COUNT * 3);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * REFLECTED_STAR_SPREAD_X;
      positions[i + 1] = 0;
      positions[i + 2] = (Math.random() - 0.5) * REFLECTED_STAR_SPREAD_Z;
    }
    return positions;
  }, []);

  const originalPositions = useMemo(() => new Float32Array(particles), [particles]);

  useFrame((state) => {
    // パフォーマンス向上：2フレームに1回だけ頂点を更新
    frameCount.current++;
    if (frameCount.current % 2 === 0 && pointsRef.current && visible) {
      const time = state.clock.getElapsedTime();
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        // Y座標を波のようにアニメーションさせる
        positions[i + 1] = Math.sin(x * REFLECTED_STAR_WAVE_FREQUENCY + time) * REFLECTED_STAR_WAVE_AMPLITUDE + Math.cos(z * REFLECTED_STAR_WAVE_FREQUENCY + time) * REFLECTED_STAR_WAVE_AMPLITUDE;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        visible ? REFLECTED_STAR_OPACITY : 0,
        STAR_FADE_SPEED
      );
    }
  });

  return (
    <points ref={pointsRef} position={[0, REFLECTED_STAR_POSITION_Y, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        ref={materialRef}
        transparent
        color={REFLECTED_STAR_COLOR}
        size={STAR_MATERIAL.size}
        sizeAttenuation={STAR_MATERIAL.sizeAttenuation}
        depthWrite={STAR_MATERIAL.depthWrite}
        fog={STAR_MATERIAL.fog}
        opacity={0}
      />
    </points>
  );
};

export default ReflectedStars;
