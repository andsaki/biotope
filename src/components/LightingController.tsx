import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import { useDayPeriod } from "../contexts/TimeContext";
import {
  LIGHTING_TRANSITION_SPEED,
  DAY_INTENSITY,
  NIGHT_INTENSITY,
  SEASON_COLORS,
  DIRECTIONAL_SHADOW_MAP_SIZE,
} from "../constants/lighting";

/** ライティング制御のプロパティ */
interface LightingControllerProps {
  /** 指向性ライトへの参照 */
  directionalLightRef: React.RefObject<THREE.DirectionalLight>;
  /** 環境光への参照 */
  ambientLightRef: React.RefObject<THREE.AmbientLight>;
  /** ポイントライトへの参照 */
  pointLightRef: React.RefObject<THREE.PointLight>;
  /** スポットライトへの参照 */
  spotLightRef: React.RefObject<THREE.SpotLight>;
}

/**
 * ライティング制御コンポーネント
 * 昼夜と季節に応じてライトの強度と色を動的に調整
 * @param props - コンポーネントのプロパティ
 */
const LightingController: React.FC<LightingControllerProps> = ({
  directionalLightRef,
  ambientLightRef,
  pointLightRef,
  spotLightRef,
}) => {
  const isDay = useDayPeriod();
  const { season } = useSeason();
  const shadowQualityRef = React.useRef<"day" | "night">(isDay ? "day" : "night");

  useFrame((_, delta) => {
    if (
      directionalLightRef.current &&
      ambientLightRef.current &&
      pointLightRef.current &&
      spotLightRef.current
    ) {
      const shadowProfile = isDay ? "day" : "night";
      if (shadowQualityRef.current !== shadowProfile) {
        shadowQualityRef.current = shadowProfile;
        const [width, height] = DIRECTIONAL_SHADOW_MAP_SIZE[shadowProfile];
        directionalLightRef.current.shadow.mapSize.set(width, height);
        directionalLightRef.current.shadow.map?.dispose();
        directionalLightRef.current.shadow.map = null;
      }

      // 季節ごとの照明設定
      const seasonColors = SEASON_COLORS[season];
      const dayNightColors = isDay ? seasonColors.day : seasonColors.night;

      const targetColor = dayNightColors.directional;
      const targetAmbientColor = dayNightColors.ambient;

      let targetIntensity: number;
      if (season === "summer") {
        targetIntensity = isDay ? DAY_INTENSITY.directional.summer : NIGHT_INTENSITY.directional.summer;
      } else if (season === "winter") {
        targetIntensity = isDay ? DAY_INTENSITY.directional.winter : NIGHT_INTENSITY.directional.winter;
      } else {
        targetIntensity = isDay ? DAY_INTENSITY.directional.default : NIGHT_INTENSITY.directional.default;
      }

      const targetAmbientIntensity = isDay ? DAY_INTENSITY.ambient : NIGHT_INTENSITY.ambient;
      const targetPointIntensity = isDay ? DAY_INTENSITY.point : NIGHT_INTENSITY.point;
      const targetSpotIntensity = isDay ? DAY_INTENSITY.spot : NIGHT_INTENSITY.spot;

      // スムーズな切り替え
      directionalLightRef.current.intensity +=
        (targetIntensity - directionalLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
      directionalLightRef.current.color.lerp(new THREE.Color(targetColor), delta * LIGHTING_TRANSITION_SPEED);

      ambientLightRef.current.intensity +=
        (targetAmbientIntensity - ambientLightRef.current.intensity) *
        delta *
        LIGHTING_TRANSITION_SPEED;
      ambientLightRef.current.color.lerp(new THREE.Color(targetAmbientColor), delta * LIGHTING_TRANSITION_SPEED);

      pointLightRef.current.intensity +=
        (targetPointIntensity - pointLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
      spotLightRef.current.intensity +=
        (targetSpotIntensity - spotLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
    }
  });

  return null; // このコンポーネントは目に見えるものをレンダリングしません
};

export default LightingController;
