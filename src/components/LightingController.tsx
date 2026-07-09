import React from "react";
import * as THREE from "three";
import { useSeason, useDayPeriod } from "../contexts";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import {
  LIGHTING_TRANSITION_SPEED,
  DAY_INTENSITY,
  NIGHT_INTENSITY,
  SEASON_COLORS,
  DIRECTIONAL_SHADOW_MAP_SIZE,
} from "../constants/lighting";
import {
  getCloudIntensity,
  getFogIntensity,
  getRainIntensity,
  getSolarIntensity,
  type WeatherSnapshot,
} from "@/utils/weather";

/** ライティング制御のプロパティ */
interface LightingControllerProps {
  /** 指向性ライトへの参照 */
  directionalLightRef: React.RefObject<THREE.DirectionalLight | null>;
  /** 環境光への参照 */
  ambientLightRef: React.RefObject<THREE.AmbientLight | null>;
  /** ポイントライトへの参照 */
  pointLightRef: React.RefObject<THREE.PointLight | null>;
  /** スポットライトへの参照 */
  spotLightRef: React.RefObject<THREE.SpotLight | null>;
  /** 現在の天気 */
  weather: WeatherSnapshot;
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
  weather,
}) => {
  const isDay = useDayPeriod();
  const { season } = useSeason();
  const shadowQualityRef = React.useRef<"day" | "night">(isDay ? "day" : "night");

  // Color オブジェクトを再利用してGC負荷を削減
  const directionalColorRef = React.useRef(new THREE.Color());
  const ambientColorRef = React.useRef(new THREE.Color());

  useThrottledFrame((_, delta) => {
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
      const cloudIntensity = getCloudIntensity(weather);
      const rainIntensity = getRainIntensity(weather);
      const fogIntensity = getFogIntensity(weather);
      const solarIntensity = getSolarIntensity(weather);
      const weatherDimming = Math.max(
        0.42,
        0.72 + solarIntensity * 0.38 - cloudIntensity * 0.22 - rainIntensity * 0.3 - fogIntensity * 0.2
      );
      const ambientDimming = Math.max(0.58, 1 - cloudIntensity * 0.14 - rainIntensity * 0.16 - fogIntensity * 0.18);

      let targetIntensity: number;
      if (season === "summer") {
        targetIntensity = isDay ? DAY_INTENSITY.directional.summer : NIGHT_INTENSITY.directional.summer;
      } else if (season === "winter") {
        targetIntensity = isDay ? DAY_INTENSITY.directional.winter : NIGHT_INTENSITY.directional.winter;
      } else {
        targetIntensity = isDay ? DAY_INTENSITY.directional.default : NIGHT_INTENSITY.directional.default;
      }

      targetIntensity *= weatherDimming;

      const targetAmbientIntensity = (isDay ? DAY_INTENSITY.ambient : NIGHT_INTENSITY.ambient) * ambientDimming;
      const targetPointIntensity = (isDay ? DAY_INTENSITY.point : NIGHT_INTENSITY.point) * (0.88 + weatherDimming * 0.12);
      const targetSpotIntensity = (isDay ? DAY_INTENSITY.spot : NIGHT_INTENSITY.spot) * (0.82 + weatherDimming * 0.18);

      // スムーズな切り替え
      directionalLightRef.current.intensity +=
        (targetIntensity - directionalLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
      directionalLightRef.current.color.lerp(directionalColorRef.current.set(targetColor), delta * LIGHTING_TRANSITION_SPEED);

      ambientLightRef.current.intensity +=
        (targetAmbientIntensity - ambientLightRef.current.intensity) *
        delta *
        LIGHTING_TRANSITION_SPEED;
      ambientLightRef.current.color.lerp(ambientColorRef.current.set(targetAmbientColor), delta * LIGHTING_TRANSITION_SPEED);

      pointLightRef.current.intensity +=
        (targetPointIntensity - pointLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
      spotLightRef.current.intensity +=
        (targetSpotIntensity - spotLightRef.current.intensity) * delta * LIGHTING_TRANSITION_SPEED;
    }
  }, 20);

  return null; // このコンポーネントは目に見えるものをレンダリングしません
};

export default LightingController;
