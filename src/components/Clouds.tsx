import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThrottledFrame } from '../hooks/useThrottledFrame';
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

interface CloudInstance {
  basePosition: [number, number, number];
  scale: number;
  speed: number;
  waveOffsetY: number;
  waveOffsetZ: number;
  parts: Array<{ position: [number, number, number]; scale: number }>;
}

const Clouds: React.FC<{ timeScale: number }> = ({ timeScale }) => {
  const cloudRefs = useRef<Array<THREE.Group | null>>([]);
  const sharedGeometry = useMemo(
    () => new THREE.SphereGeometry(CLOUD_SPHERE_RADIUS, CLOUD_SPHERE_WIDTH_SEGMENTS, CLOUD_SPHERE_HEIGHT_SEGMENTS),
    []
  );
  const sharedMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CLOUD_COLOR,
        transparent: true,
        opacity: CLOUD_OPACITY,
        emissive: new THREE.Color(CLOUD_EMISSIVE_COLOR),
        emissiveIntensity: CLOUD_EMISSIVE_INTENSITY,
      }),
    []
  );

  const clouds = useMemo<CloudInstance[]>(() => {
    const instances: CloudInstance[] = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const x = Math.random() * CLOUD_POSITION_X_RANGE + CLOUD_POSITION_X_OFFSET;
      const y = CLOUD_POSITION_Y_BASE + Math.random() * CLOUD_POSITION_Y_RANGE;
      const z = Math.random() * CLOUD_POSITION_Z_RANGE + CLOUD_POSITION_Z_OFFSET;
      const scale = CLOUD_SCALE_BASE + Math.random() * CLOUD_SCALE_RANGE;
      const speed = CLOUD_SPEED_BASE + Math.random() * CLOUD_SPEED_RANGE;
      const numParts = CLOUD_PARTS_MIN + Math.floor(Math.random() * (CLOUD_PARTS_MAX - CLOUD_PARTS_MIN + 1));
      const parts: Array<{ position: [number, number, number]; scale: number }> = [];
      for (let j = 0; j < numParts; j++) {
        parts.push({
          position: [
            (Math.random() - 0.5) * CLOUD_PART_POSITION_X_RANGE,
            (Math.random() - 0.5) * CLOUD_PART_POSITION_Y_RANGE,
            (Math.random() - 0.5) * CLOUD_PART_POSITION_Z_RANGE,
          ],
          scale: CLOUD_PART_SCALE_BASE + Math.random() * CLOUD_PART_SCALE_RANGE,
        });
      }
      instances.push({
        basePosition: [x, y, z],
        scale,
        speed,
        parts,
        waveOffsetY: x,
        waveOffsetZ: y,
      });
    }
    return instances;
  }, []);

  useThrottledFrame(
    (state, accumulatedDelta) => {
      const frameScale = accumulatedDelta * 60; // 60fps換算で速度を維持
      const time = state.clock.getElapsedTime();
      cloudRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const data = clouds[index];
        const xIncrement = data.speed * CLOUD_MOVEMENT_SPEED * timeScale * frameScale;
        ref.position.x += xIncrement;
        ref.position.y =
          data.basePosition[1] +
          Math.sin(time * CLOUD_WAVE_Y_SPEED + data.waveOffsetY) * CLOUD_WAVE_Y_AMPLITUDE;
        ref.position.z =
          data.basePosition[2] +
          Math.cos(time * CLOUD_WAVE_Z_SPEED + data.waveOffsetZ) * CLOUD_WAVE_Z_AMPLITUDE;
        ref.rotation.y += data.speed * CLOUD_ROTATION_SPEED * timeScale * frameScale;

        if (ref.position.x > CLOUD_RESET_X_THRESHOLD) {
          ref.position.x = CLOUD_RESET_X_POSITION;
        }
      });
    },
    30
  );

  return (
    <group>
      {clouds.map((cloud, index) => (
        <group
          key={index}
          ref={(node) => {
            cloudRefs.current[index] = node;
          }}
          position={[cloud.basePosition[0], cloud.basePosition[1], cloud.basePosition[2]]}
          scale={[cloud.scale, cloud.scale * CLOUD_SCALE_Y_MULTIPLIER, cloud.scale]}
        >
          {cloud.parts.map((part, partIndex) => (
            <mesh
              key={partIndex}
              position={part.position}
              scale={part.scale}
              geometry={sharedGeometry}
              material={sharedMaterial}
            />
          ))}
        </group>
      ))}
    </group>
  );
};

export default Clouds;
