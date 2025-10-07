import React from 'react';
import * as THREE from 'three';
import type { SunPosition } from '../utils/sunPosition';

interface SceneLightsProps {
  sunPosition: SunPosition;
  directionalLightRef: React.RefObject<THREE.DirectionalLight>;
  ambientLightRef: React.RefObject<THREE.AmbientLight>;
  pointLightRef: React.RefObject<THREE.PointLight>;
  spotLightRef: React.RefObject<THREE.SpotLight>;
}

/**
 * シーン全体のライティング設定を管理するコンポーネント
 */
export const SceneLights: React.FC<SceneLightsProps> = ({
  sunPosition,
  directionalLightRef,
  ambientLightRef,
  pointLightRef,
  spotLightRef,
}) => {
  return (
    <>
      {/* 環境光 */}
      <ambientLight
        ref={ambientLightRef}
        intensity={0.5}
        color="#87CEEB"
      />

      {/* ポイントライト */}
      <pointLight
        ref={pointLightRef}
        position={[10, 10, 10]}
        intensity={0.5}
        color="#FFFFFF"
      />

      {/* 太陽光をシミュレートする指向性ライト */}
      <directionalLight
        ref={directionalLightRef}
        position={[sunPosition.x, sunPosition.y, sunPosition.z]}
        intensity={8.0}
        color="#FFD700"
        castShadow={true}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* スポットライト */}
      <spotLight
        ref={spotLightRef}
        position={[5, 8, 5]}
        angle={0.5}
        penumbra={0.2}
        intensity={1.0}
        color="#FFFFFF"
        castShadow={true}
      />
    </>
  );
};
