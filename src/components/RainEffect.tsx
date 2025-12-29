import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  RAIN_DROP_COUNT,
  RAIN_DROP_SIZE,
  RAIN_DROP_SPEED,
  RAIN_SPAWN_AREA,
  RAIN_COLOR,
  RAIN_OPACITY,
} from '../constants/rainEffect';

interface RainDrop {
  position: [number, number, number];
  velocity: [number, number];
  phase: number;
}

const RainEffect: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 雨粒の初期データを生成（一度だけ）
  const rainDrops = useMemo<RainDrop[]>(() => {
    return Array.from({ length: RAIN_DROP_COUNT }, () => ({
      position: [
        Math.random() * (RAIN_SPAWN_AREA.X_MAX - RAIN_SPAWN_AREA.X_MIN) +
          RAIN_SPAWN_AREA.X_MIN,
        Math.random() * 10 + RAIN_SPAWN_AREA.Y,
        Math.random() * (RAIN_SPAWN_AREA.Z_MAX - RAIN_SPAWN_AREA.Z_MIN) +
          RAIN_SPAWN_AREA.Z_MIN,
      ] as [number, number, number],
      velocity: [
        (Math.random() - 0.5) * RAIN_DROP_SPEED.X_VARIATION,
        RAIN_DROP_SPEED.Y,
      ] as [number, number],
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // アニメーション
  useFrame(() => {
    if (!meshRef.current) return;

    rainDrops.forEach((drop, i) => {
      // 落下処理
      drop.position[1] += drop.velocity[1];
      drop.position[0] += drop.velocity[0];

      // 地面に到達したらリセット
      if (drop.position[1] < 0) {
        drop.position[1] = RAIN_SPAWN_AREA.Y;
        drop.position[0] =
          Math.random() * (RAIN_SPAWN_AREA.X_MAX - RAIN_SPAWN_AREA.X_MIN) +
          RAIN_SPAWN_AREA.X_MIN;
        drop.position[2] =
          Math.random() * (RAIN_SPAWN_AREA.Z_MAX - RAIN_SPAWN_AREA.Z_MIN) +
          RAIN_SPAWN_AREA.Z_MIN;
      }

      // 行列を更新
      dummy.position.set(drop.position[0], drop.position[1], drop.position[2]);
      dummy.rotation.z = drop.phase;
      dummy.updateMatrix();
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_DROP_COUNT]}>
      <cylinderGeometry args={[RAIN_DROP_SIZE.WIDTH, RAIN_DROP_SIZE.WIDTH, RAIN_DROP_SIZE.HEIGHT, 4]} />
      <meshBasicMaterial color={RAIN_COLOR} transparent opacity={RAIN_OPACITY} />
    </instancedMesh>
  );
};

export default React.memo(RainEffect);
