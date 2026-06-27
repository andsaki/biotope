import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThrottledFrame } from '../hooks/useThrottledFrame';
import {
  RAIN_DROP_COUNT,
  RAIN_DROP_SIZE,
  RAIN_DROP_SPEED,
  RAIN_SPAWN_AREA,
  RAIN_COLOR,
  RAIN_OPACITY,
  RAIN_RESET_Y,
  RAIN_DROP_TILT,
} from '../constants/rainEffect';

interface RainDrop {
  position: [number, number, number];
  velocity: [number, number];
}

const spawnRainDrop = (): RainDrop => ({
  position: [
    Math.random() * (RAIN_SPAWN_AREA.X_MAX - RAIN_SPAWN_AREA.X_MIN) +
      RAIN_SPAWN_AREA.X_MIN,
    Math.random() * (RAIN_SPAWN_AREA.Y_MAX - RAIN_SPAWN_AREA.Y_MIN) +
      RAIN_SPAWN_AREA.Y_MIN,
    Math.random() * (RAIN_SPAWN_AREA.Z_MAX - RAIN_SPAWN_AREA.Z_MIN) +
      RAIN_SPAWN_AREA.Z_MIN,
  ] as [number, number, number],
  velocity: [
    RAIN_DROP_SPEED.X_BASE + (Math.random() - 0.5) * RAIN_DROP_SPEED.X_VARIATION,
    -(RAIN_DROP_SPEED.Y_BASE + Math.random() * RAIN_DROP_SPEED.Y_VARIATION),
  ] as [number, number],
});

interface RainEffectProps {
  intensity?: number;
}

const RainEffect: React.FC<RainEffectProps> = ({ intensity = 1 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: RAIN_COLOR,
        transparent: true,
        opacity: RAIN_OPACITY,
      }),
    []
  );
  const activeDropCount = useMemo(
    () => Math.max(80, Math.min(RAIN_DROP_COUNT, Math.round(RAIN_DROP_COUNT * (0.35 + intensity * 0.75)))),
    [intensity]
  );
  const speedMultiplier = 0.82 + intensity * 0.46;

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  // 雨粒の初期データを生成（一度だけ）
  const rainDrops = useMemo<RainDrop[]>(() => {
    return Array.from({ length: RAIN_DROP_COUNT }, spawnRainDrop);
  }, []);

  // アニメーション
  useThrottledFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.count = activeDropCount;
    material.opacity = RAIN_OPACITY * (0.62 + intensity * 0.7);

    for (let i = 0; i < activeDropCount; i += 1) {
      const drop = rainDrops[i];
      // 落下処理
      drop.position[1] += drop.velocity[1] * delta * speedMultiplier;
      drop.position[0] += drop.velocity[0] * delta * (0.85 + intensity * 0.4);

      // 地面に到達したらリセット
      if (drop.position[1] < RAIN_RESET_Y) {
        const nextDrop = spawnRainDrop();
        drop.position = nextDrop.position;
        drop.velocity = nextDrop.velocity;
      }

      // 行列を更新
      dummy.position.set(drop.position[0], drop.position[1], drop.position[2]);
      dummy.rotation.z = RAIN_DROP_TILT;
      dummy.updateMatrix();
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, 30);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RAIN_DROP_COUNT]}>
      <cylinderGeometry args={[RAIN_DROP_SIZE.WIDTH, RAIN_DROP_SIZE.WIDTH, RAIN_DROP_SIZE.HEIGHT, 4]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
};

export default React.memo(RainEffect);
