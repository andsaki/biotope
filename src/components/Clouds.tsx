import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CLOUD_COUNT,
  CLOUD_POSITION_X_RANGE,
  CLOUD_POSITION_X_OFFSET,
  CLOUD_POSITION_Y_BASE,
  CLOUD_POSITION_Y_RANGE,
  CLOUD_POSITION_Z_RANGE,
  CLOUD_POSITION_Z_OFFSET,
  CLOUD_SCALE_BASE,
  CLOUD_SCALE_RANGE,
  CLOUD_SPEED_BASE,
  CLOUD_SPEED_RANGE,
  CLOUD_MOVEMENT_SPEED,
  CLOUD_ROTATION_SPEED,
  CLOUD_WAVE_Y_SPEED,
  CLOUD_WAVE_Y_AMPLITUDE,
  CLOUD_WAVE_Z_SPEED,
  CLOUD_WAVE_Z_AMPLITUDE,
  CLOUD_RESET_X_THRESHOLD,
  CLOUD_RESET_X_POSITION,
  CLOUD_PARTS_MIN,
  CLOUD_PARTS_MAX,
  CLOUD_PART_SCALE_BASE,
  CLOUD_PART_SCALE_RANGE,
  CLOUD_PART_POSITION_X_RANGE,
  CLOUD_PART_POSITION_Y_RANGE,
  CLOUD_PART_POSITION_Z_RANGE,
  CLOUD_SCALE_Y_MULTIPLIER,
  CLOUD_SPHERE_RADIUS,
  CLOUD_SPHERE_WIDTH_SEGMENTS,
  CLOUD_SPHERE_HEIGHT_SEGMENTS,
  CLOUD_COLOR,
  CLOUD_OPACITY,
  CLOUD_EMISSIVE_COLOR,
  CLOUD_EMISSIVE_INTENSITY,
} from '../constants/clouds';

/** 雲コンポーネントのプロパティ */
interface CloudProps {
  /** 雲の位置 */
  position: [number, number, number];
  /** 雲のスケール */
  scale: number;
  /** 移動速度 */
  speed: number;
  /** 時間スケール */
  timeScale: number;
}

/**
 * 個別の雲コンポーネント
 * 風に流れる雲をシミュレート
 * @param props - コンポーネントのプロパティ
 */
const Cloud: React.FC<CloudProps> = React.memo(({ position, scale, speed, timeScale }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // X軸方向にゆっくりと移動
      groupRef.current.position.x += speed * CLOUD_MOVEMENT_SPEED * timeScale; // timeScaleを乗算
      // Y軸とZ軸に微細な揺れを追加して、風に揺れるような効果を出す
      groupRef.current.position.y = position[1] + Math.sin(time * CLOUD_WAVE_Y_SPEED + position[0]) * CLOUD_WAVE_Y_AMPLITUDE;
      groupRef.current.position.z = position[2] + Math.cos(time * CLOUD_WAVE_Z_SPEED + position[1]) * CLOUD_WAVE_Z_AMPLITUDE;
      // ゆっくりと回転させる
      groupRef.current.rotation.y += speed * CLOUD_ROTATION_SPEED * timeScale; // timeScaleを乗算

      if (groupRef.current.position.x > CLOUD_RESET_X_THRESHOLD) { // 画面外に出たら反対側から再出現
        groupRef.current.position.x = CLOUD_RESET_X_POSITION;
      }
    }
  });

  // 複数の球体を組み合わせて雲の形を表現
  // ジオメトリとマテリアルをメモ化してパフォーマンス向上
  const geometry = useMemo(() => new THREE.SphereGeometry(CLOUD_SPHERE_RADIUS, CLOUD_SPHERE_WIDTH_SEGMENTS, CLOUD_SPHERE_HEIGHT_SEGMENTS), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: CLOUD_COLOR,
    transparent: true,
    opacity: CLOUD_OPACITY,
    emissive: new THREE.Color(CLOUD_EMISSIVE_COLOR),
    emissiveIntensity: CLOUD_EMISSIVE_INTENSITY
  }), []);

  const cloudParts = useMemo(() => {
    const parts = [];
    const numParts = CLOUD_PARTS_MIN + Math.floor(Math.random() * (CLOUD_PARTS_MAX - CLOUD_PARTS_MIN + 1));
    for (let i = 0; i < numParts; i++) {
      const partScale = CLOUD_PART_SCALE_BASE + Math.random() * CLOUD_PART_SCALE_RANGE;
      const partPosition: [number, number, number] = [
        (Math.random() - 0.5) * CLOUD_PART_POSITION_X_RANGE,
        (Math.random() - 0.5) * CLOUD_PART_POSITION_Y_RANGE,
        (Math.random() - 0.5) * CLOUD_PART_POSITION_Z_RANGE,
      ];
      parts.push(
        <mesh key={i} position={partPosition} scale={partScale} geometry={geometry} material={material} />
      );
    }
    return parts;
  }, [geometry, material]);

  return (
    <group ref={groupRef} position={position} scale={[scale, scale * CLOUD_SCALE_Y_MULTIPLIER, scale]}>
      {cloudParts}
    </group>
  );
});

const Clouds: React.FC<{ timeScale: number }> = ({ timeScale }) => {
  const clouds = useMemo(() => {
    const tempClouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const x = Math.random() * CLOUD_POSITION_X_RANGE + CLOUD_POSITION_X_OFFSET;
      const y = CLOUD_POSITION_Y_BASE + Math.random() * CLOUD_POSITION_Y_RANGE;
      const z = Math.random() * CLOUD_POSITION_Z_RANGE + CLOUD_POSITION_Z_OFFSET;
      const scale = CLOUD_SCALE_BASE + Math.random() * CLOUD_SCALE_RANGE;
      const speed = CLOUD_SPEED_BASE + Math.random() * CLOUD_SPEED_RANGE;
      tempClouds.push({ position: [x, y, z], scale, speed });
    }
    return tempClouds;
  }, []);

  return (
    <group>
      {clouds.map((cloud, index) => (
        <Cloud key={index} position={cloud.position as [number, number, number]} scale={cloud.scale} speed={cloud.speed} timeScale={timeScale} />
      ))}
    </group>
  );
};

export default Clouds;
