import React, { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { PointMaterial } from "@react-three/drei";
import { useDayPeriod } from "../contexts";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import { createRng, randomBetween } from "../utils/random";
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
  const pointsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
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

  const particles = useMemo(() => {
    const positions = new Float32Array(REFLECTED_STAR_COUNT * 3);
    const rng = createRng(0x5ea51de);
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = randomBetween(rng, -REFLECTED_STAR_SPREAD_X / 2, REFLECTED_STAR_SPREAD_X / 2);
      positions[i + 1] = 0;
      positions[i + 2] = randomBetween(rng, -REFLECTED_STAR_SPREAD_Z / 2, REFLECTED_STAR_SPREAD_Z / 2);
    }
    return positions;
  }, []);

  const originalPositions = useMemo(() => new Float32Array(particles), [particles]);

  useThrottledFrame((state) => {
    if (!visible && !isNight) {
      return;
    }

    if (pointsRef.current && visible) {
      const time = state.clock.getElapsedTime();
      const positions = pointsRef.current.geometry.attributes.position.array;
      if (!(positions instanceof Float32Array)) {
        return;
      }

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
  }, 20);

  if (!visible && !isNight) {
    return null;
  }

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
