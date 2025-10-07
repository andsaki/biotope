import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LightingControllerProps {
  isDay: boolean;
  directionalLightRef: React.RefObject<THREE.DirectionalLight>;
  ambientLightRef: React.RefObject<THREE.AmbientLight>;
  pointLightRef: React.RefObject<THREE.PointLight>;
  spotLightRef: React.RefObject<THREE.SpotLight>;
}

const LightingController: React.FC<LightingControllerProps> = ({
  isDay,
  directionalLightRef,
  ambientLightRef,
  pointLightRef,
  spotLightRef,
}) => {
  useFrame((_, delta) => {
    if (
      directionalLightRef.current &&
      ambientLightRef.current &&
      pointLightRef.current &&
      spotLightRef.current
    ) {
      // 照明の変更のためのスムーズな切り替え
      const targetIntensity = isDay ? 5.0 : 1.0;
      const targetAmbientIntensity = isDay ? 0.5 : 0.3;
      const targetPointIntensity = isDay ? 0.5 : 0.4;
      const targetSpotIntensity = isDay ? 1.0 : 0.6;
      const targetColor = isDay ? "#FFD700" : "#CCCCCC";
      const targetAmbientColor = isDay ? "#87CEEB" : "#333333";

      directionalLightRef.current.intensity +=
        (targetIntensity - directionalLightRef.current.intensity) * delta * 2;
      directionalLightRef.current.color.set(targetColor);
      ambientLightRef.current.intensity +=
        (targetAmbientIntensity - ambientLightRef.current.intensity) *
        delta *
        2;
      ambientLightRef.current.color.set(targetAmbientColor);
      pointLightRef.current.intensity +=
        (targetPointIntensity - pointLightRef.current.intensity) * delta * 2;
      spotLightRef.current.intensity +=
        (targetSpotIntensity - spotLightRef.current.intensity) * delta * 2;
    }
  });

  return null; // このコンポーネントは目に見えるものをレンダリングしません
};

export default LightingController;
