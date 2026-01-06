import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useModelScene } from "../hooks/useModelScene";
import {
  LILY_DATA,
  WATER_HEIGHT_BASE,
  WATER_HEIGHT_AMPLITUDE,
  WATER_HEIGHT_FREQUENCY,
  LILY_WAVE_FREQUENCY,
  LILY_WAVE_TIME_SCALE,
  LILY_WAVE_AMPLITUDE,
  LILY_ROTATION_TIME_SCALE,
  LILY_ROTATION_AMPLITUDE,
  LILY_TILT_X_TIME_SCALE,
  LILY_TILT_X_AMPLITUDE,
  LILY_TILT_Z_TIME_SCALE,
  LILY_TILT_Z_PHASE_MULTIPLIER,
  LILY_TILT_Z_AMPLITUDE,
} from "../constants/waterPlants";

/**
 * 蓮の葉コンポーネント（夏季限定）
 * 水面の波に連動してアニメーション
 */
const LilyPads: React.FC = () => {
  const lilyRefs = useRef<THREE.Group[]>([]);
  const lilyScene = useModelScene("lily");

  // 蓮の葉のcloneを事前に作成してパフォーマンス向上
  const lilyClones = useMemo(() =>
    LILY_DATA.map(() => lilyScene.clone())
  , [lilyScene]);

  // 蓮の葉のアニメーション（水面の波に連動）
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // 水面の高さ（WaterSurface.tsxと同じ計算式）
    const waterHeight = WATER_HEIGHT_BASE + Math.sin(time * WATER_HEIGHT_FREQUENCY) * WATER_HEIGHT_AMPLITUDE;

    lilyRefs.current.forEach((ref, i) => {
      if (ref) {
        const data = LILY_DATA[i];
        // 水面の波に完全に連動（各葉の位置での波紋を考慮）
        const localWave = Math.sin(data.position[0] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
                         Math.cos(data.position[2] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) * LILY_WAVE_AMPLITUDE;
        ref.position.y = waterHeight + localWave;

        // わずかな回転（水流の影響）
        ref.rotation.y = data.rotation + Math.sin(time * LILY_ROTATION_TIME_SCALE + data.phaseOffset) * LILY_ROTATION_AMPLITUDE;
        // わずかな傾き（波の傾斜に合わせて）
        ref.rotation.x = Math.sin(time * LILY_TILT_X_TIME_SCALE + data.phaseOffset) * LILY_TILT_X_AMPLITUDE;
        ref.rotation.z = Math.cos(time * LILY_TILT_Z_TIME_SCALE + data.phaseOffset * LILY_TILT_Z_PHASE_MULTIPLIER) * LILY_TILT_Z_AMPLITUDE;
      }
    });
  });

  return (
    <group>
      {LILY_DATA.map((data, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) lilyRefs.current[i] = el;
          }}
          position={data.position}
          rotation={[0, data.rotation, 0]}
          scale={[data.scale, data.scale, data.scale]}
        >
          <primitive object={lilyClones[i]} />
        </group>
      ))}
    </group>
  );
};

export default LilyPads;
