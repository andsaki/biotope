import React, { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import {
  LILY_MODEL_URL,
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
  WATER_PLANTS,
  WATER_PLANT_CYLINDER,
  PLANT_COLORS,
} from "../constants/waterPlants";

/**
 * 大型水草コンポーネント
 * 季節に応じて色が変化する水中の水草と蓮の葉
 */
const WaterPlantsLarge: React.FC = () => {
  const { season } = useSeason();
  const lilyRefs = useRef<THREE.Group[]>([]);

  // R2から直接読み込み（ファイルサイズが大きいため）
  const { scene: lilyScene } = LILY_MODEL_URL
    ? useGLTF(LILY_MODEL_URL, true)
    : { scene: new THREE.Group() };

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

  // 季節ごとの水草の色
  const plantColor = useMemo(() => {
    return PLANT_COLORS[season] || PLANT_COLORS.winter;
  }, [season]);

  return (
    <group>
      {/* 水草 - 地面に配置する */}
      {WATER_PLANTS.map((plant, i) => (
        <mesh
          key={i}
          position={plant.position}
          rotation={plant.rotation}
          scale={plant.scale}
        >
          <cylinderGeometry args={[
            WATER_PLANT_CYLINDER.radiusTop,
            WATER_PLANT_CYLINDER.radiusBottom,
            WATER_PLANT_CYLINDER.height,
            WATER_PLANT_CYLINDER.radialSegments
          ]} />
          <meshStandardMaterial color={plantColor} />
        </mesh>
      ))}

      {/* 蓮の葉 - 夏だけ水面付近に配置 */}
      {season === "summer" && LILY_DATA.map((data, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) lilyRefs.current[i] = el;
          }}
          position={data.position}
          rotation={[0, data.rotation, 0]}
          scale={[data.scale, data.scale, data.scale]}
        >
          <primitive object={lilyScene.clone()} />
        </group>
      ))}
    </group>
  );
};

export default WaterPlantsLarge;
