import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PointMaterial } from "@react-three/drei";
import { useTime } from "../contexts/TimeContext";

/**
 * 水面に反射する星空コンポーネント
 * 夜間に水面下に表示される星の反射
 */
const ReflectedStars: React.FC = () => {
  const { isDay } = useTime();
  const isNight = !isDay;
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<any>(null!);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isNight) {
      timer = setTimeout(() => setVisible(true), 5000); // 星と同じ遅延
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isNight]);

  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3); // 反射用の星は少なめに
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20; // 水面に広がるようにX座標を設定
      positions[i + 1] = 0; // Y座標は0で初期化（後で水面の位置に合わせる）
      positions[i + 2] = (Math.random() - 0.5) * 20; // 水面に広がるようにZ座標を設定
    }
    return positions;
  }, []);

  const originalPositions = useMemo(() => new Float32Array(particles), [particles]);

  useFrame((state) => {
    if (pointsRef.current && visible) {
      const time = state.clock.getElapsedTime();
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const z = originalPositions[i + 2];
        // Y座標を波のようにアニメーションさせる
        positions[i + 1] = Math.sin(x * 0.5 + time) * 0.1 + Math.cos(z * 0.5 + time) * 0.1;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        visible ? 0.5 : 0, // 反射なので少し薄く表示
        0.05
      );
    }
  });

  return (
    <points ref={pointsRef} position={[0, 8, 0]}>
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
        color="#FFFFFF"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        fog={false}
        opacity={0}
      />
    </points>
  );
};

export default ReflectedStars;
