import React from 'react';
import * as THREE from 'three';
import type { SunPosition } from '../utils/sunPosition';
import { SCENE_LIGHTS } from '../constants/lighting';

/** ライティングコンポーネントのプロパティ */
interface SceneLightsProps {
  /** 太陽の位置 */
  sunPosition: SunPosition;
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
 * シーン全体のライティング設定を管理するコンポーネント
 * 環境光、ポイントライト、太陽光（指向性ライト）、スポットライトを管理
 * @param props - コンポーネントのプロパティ
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
        intensity={SCENE_LIGHTS.ambient.intensity}
        color={SCENE_LIGHTS.ambient.color}
      />

      {/* ポイントライト */}
      <pointLight
        ref={pointLightRef}
        position={SCENE_LIGHTS.point.position}
        intensity={SCENE_LIGHTS.point.intensity}
        color={SCENE_LIGHTS.point.color}
      />

      {/* 太陽光をシミュレートする指向性ライト */}
      <directionalLight
        ref={directionalLightRef}
        position={[sunPosition.x, sunPosition.y, sunPosition.z]}
        intensity={SCENE_LIGHTS.directional.intensity}
        color={SCENE_LIGHTS.directional.color}
        castShadow={true}
        shadow-mapSize={SCENE_LIGHTS.directional.shadowMapSize}
        shadow-camera-near={SCENE_LIGHTS.directional.shadowCameraNear}
        shadow-camera-far={SCENE_LIGHTS.directional.shadowCameraFar}
        shadow-camera-left={SCENE_LIGHTS.directional.shadowCameraLeft}
        shadow-camera-right={SCENE_LIGHTS.directional.shadowCameraRight}
        shadow-camera-top={SCENE_LIGHTS.directional.shadowCameraTop}
        shadow-camera-bottom={SCENE_LIGHTS.directional.shadowCameraBottom}
      />

      {/* スポットライト */}
      <spotLight
        ref={spotLightRef}
        position={SCENE_LIGHTS.spot.position}
        angle={SCENE_LIGHTS.spot.angle}
        penumbra={SCENE_LIGHTS.spot.penumbra}
        intensity={SCENE_LIGHTS.spot.intensity}
        color={SCENE_LIGHTS.spot.color}
        castShadow={true}
      />
    </>
  );
};
