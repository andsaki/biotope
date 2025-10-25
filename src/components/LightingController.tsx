import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

/** ライティング制御のプロパティ */
interface LightingControllerProps {
  /** 昼夜の判定 */
  isDay: boolean;
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
  isDay,
  directionalLightRef,
  ambientLightRef,
  pointLightRef,
  spotLightRef,
}) => {
  const { season } = useSeason();

  useFrame((_, delta) => {
    if (
      directionalLightRef.current &&
      ambientLightRef.current &&
      pointLightRef.current &&
      spotLightRef.current
    ) {
      // 季節ごとの照明設定
      let targetColor = "#FFD700";
      let targetAmbientColor = "#87CEEB";
      let targetIntensity = isDay ? 5.0 : 1.0;

      switch (season) {
        case "spring":
          targetColor = isDay ? "#FFFACD" : "#CCCCCC"; // 柔らかい黄色
          targetAmbientColor = isDay ? "#E6F3FF" : "#333333"; // 明るい青空
          break;
        case "summer":
          targetColor = isDay ? "#FFE55C" : "#B0C4DE"; // 強い黄色
          targetAmbientColor = isDay ? "#87CEEB" : "#2F4F4F"; // 鮮やかな青
          targetIntensity = isDay ? 6.0 : 1.0; // 夏は日差しが強い
          break;
        case "autumn":
          targetColor = isDay ? "#FFA500" : "#A9A9A9"; // オレンジ色
          targetAmbientColor = isDay ? "#DEB887" : "#3A3A3A"; // 温かみのある色
          break;
        case "winter":
          targetColor = isDay ? "#E0F7FA" : "#778899"; // 冷たい青白色
          targetAmbientColor = isDay ? "#B0E0E6" : "#2C2C2C"; // 冬の青空
          targetIntensity = isDay ? 4.0 : 0.8; // 冬は日差しが弱い
          break;
      }

      const targetAmbientIntensity = isDay ? 0.5 : 0.3;
      const targetPointIntensity = isDay ? 0.5 : 0.4;
      const targetSpotIntensity = isDay ? 1.0 : 0.6;

      // スムーズな切り替え
      directionalLightRef.current.intensity +=
        (targetIntensity - directionalLightRef.current.intensity) * delta * 2;
      directionalLightRef.current.color.lerp(new THREE.Color(targetColor), delta * 2);

      ambientLightRef.current.intensity +=
        (targetAmbientIntensity - ambientLightRef.current.intensity) *
        delta *
        2;
      ambientLightRef.current.color.lerp(new THREE.Color(targetAmbientColor), delta * 2);

      pointLightRef.current.intensity +=
        (targetPointIntensity - pointLightRef.current.intensity) * delta * 2;
      spotLightRef.current.intensity +=
        (targetSpotIntensity - spotLightRef.current.intensity) * delta * 2;
    }
  });

  return null; // このコンポーネントは目に見えるものをレンダリングしません
};

export default LightingController;
