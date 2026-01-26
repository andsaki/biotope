import React, { useMemo, Suspense, lazy } from "react";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import {
  WATER_PLANTS,
  WATER_PLANT_CYLINDER,
  PLANT_COLORS,
} from "../constants/waterPlants";

// 遅延ロード: 夏に切り替わるまで読み込まない
const LilyPads = lazy(() => import("./LilyPads"));

/**
 * 大型水草コンポーネント
 * 季節に応じて色が変化する水中の水草と蓮の葉
 */
const WaterPlantsLarge: React.FC = () => {
  const { season } = useSeason();

  // 季節ごとの水草の色
  const plantColor = useMemo(() => {
    return PLANT_COLORS[season] || PLANT_COLORS.winter;
  }, [season]);

  // cylinderGeometry を共有してメモリ使用量を削減
  const sharedCylinderGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(
      WATER_PLANT_CYLINDER.radiusTop,
      WATER_PLANT_CYLINDER.radiusBottom,
      WATER_PLANT_CYLINDER.height,
      WATER_PLANT_CYLINDER.radialSegments
    );
  }, []);

  return (
    <group>
      {/* 水草 - 地面に配置する */}
      {WATER_PLANTS.map((plant, i) => (
        <mesh
          key={i}
          position={plant.position}
          rotation={plant.rotation}
          scale={plant.scale}
          geometry={sharedCylinderGeometry}
        >
          <meshStandardMaterial color={plantColor} />
        </mesh>
      ))}

      {/* 蓮の葉 - 夏だけ水面付近に配置（遅延ロード） */}
      {season === "summer" && (
        <Suspense fallback={null}>
          <LilyPads />
        </Suspense>
      )}
    </group>
  );
};

export default React.memo(WaterPlantsLarge);
