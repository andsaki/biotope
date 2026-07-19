import React, { useEffect, useMemo, useRef } from "react";
import { useSeason } from "../contexts";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useModelScene } from "../hooks/useModelScene";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import normalFishObjUrl from "../assets/Quaternius Fish/Fish1.obj?url";
import normalFishMtlUrl from "../assets/Quaternius Fish/Fish1.mtl?url";
import {
  FISH_MODEL_SCALE,
  FISH_MODEL_ROTATION,
} from "../constants/fish";
import {
  getCloudIntensity,
  getRainIntensity,
  type WeatherSnapshot,
} from "@/utils/weather";
import { createFishList, getSeasonFishProfile } from "@/fish/createFish";
import {
  applyLowPolyFlatfishMaterial,
  applyLowPolyNormalFishMaterial,
  disposeObjectMaterials,
} from "@/fish/materials";
import { updateFishMovement } from "@/fish/movement";
import {
  FISH_DORSAL_SHEEN_COLOR,
  FISH_DORSAL_SHEEN_OPACITY_MAX,
  FISH_DORSAL_SHEEN_OPACITY_MIN,
  FISH_DORSAL_SHEEN_ROTATION,
  FISH_EYE_COLOR,
  FISH_EYE_HIGHLIGHT_COLOR,
  FISH_EYE_HIGHLIGHT_OPACITY_MAX,
  FISH_EYE_HIGHLIGHT_OPACITY_MIN,
  FISH_UNDERBODY_SHADOW_COLOR,
  FISH_UNDERBODY_SHADOW_OPACITY_MAX,
  FISH_UNDERBODY_SHADOW_OPACITY_MIN,
  FISH_UNDERBODY_SHADOW_ROTATION,
  FLATFISH_DORSAL_SHEEN_POSITION,
  FLATFISH_EYE_POSITIONS,
  FLATFISH_MARK_POSITION,
  FLATFISH_MARK_ROTATION,
  FLATFISH_UNDERBODY_SHADOW_POSITION,
  getFishAccentBaseGlow,
  getFishAccentBaseOpacity,
  getUnderwaterBrightness,
  NORMAL_FISH_DORSAL_SHEEN_POSITION,
  NORMAL_FISH_EYE_POSITIONS,
  NORMAL_FISH_MARK_POSITION,
  NORMAL_FISH_MARK_ROTATION,
  NORMAL_FISH_UNDERBODY_SHADOW_POSITION,
} from "@/fish/visualDetails";

/**
 * 魚群の管理コンポーネント
 * 季節に応じた色と速度で複数の魚をアニメーション
 */
interface FishManagerProps {
  weather: WeatherSnapshot;
  waterSignal: number;
  isDay: boolean;
}

const WATER_REACTION_SECONDS = 2.2;

const FishManager: React.FC<FishManagerProps> = ({ weather, waterSignal, isDay }) => {
  const { season } = useSeason();
  const rainIntensity = getRainIntensity(weather);
  const cloudIntensity = getCloudIntensity(weather);
  const weatherSpeedMultiplier = 1.08 - rainIntensity * 0.34 - cloudIntensity * 0.12;
  const temperatureDepthOffset = weather.temperature >= 27 ? -0.28 : weather.temperature <= 8 ? -0.16 : 0;
  const weatherDepthOffset = -(rainIntensity * 0.55 + cloudIntensity * 0.18) + temperatureDepthOffset;

  const fishList = useMemo(() => createFishList(season), [season]);
  const fishProfile = useMemo(() => getSeasonFishProfile(season), [season]);
  const normalAccentGeometry = useMemo(
    () => new THREE.ConeGeometry(0.12, 0.34, 3),
    []
  );
  const flatfishAccentGeometry = useMemo(
    () => new THREE.CircleGeometry(0.16, 6),
    []
  );
  const fishEyeGeometry = useMemo(
    () => new THREE.SphereGeometry(0.025, 6, 4),
    []
  );
  const fishEyeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: FISH_EYE_COLOR,
        emissive: FISH_EYE_COLOR,
        emissiveIntensity: 0.08,
        flatShading: true,
        metalness: 0,
        roughness: 0.68,
      }),
    []
  );
  const fishEyeHighlightGeometry = useMemo(
    () => new THREE.SphereGeometry(0.008, 5, 3),
    []
  );
  const fishEyeHighlightMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FISH_EYE_HIGHLIGHT_COLOR,
        transparent: true,
        opacity: 0.82,
      }),
    []
  );
  const fishShadowGeometry = useMemo(
    () => new THREE.CircleGeometry(0.18, 10),
    []
  );
  const fishShadowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FISH_UNDERBODY_SHADOW_COLOR,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    []
  );
  const fishSheenGeometry = useMemo(
    () => new THREE.CircleGeometry(0.14, 10),
    []
  );
  const fishSheenMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: FISH_DORSAL_SHEEN_COLOR,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    []
  );

  // 晴天ほど水中に光が差し、背側の受光ハイライト・瞳のキャッチライトが
  // 強まり、水中影も締まる。3要素を同じ光量係数でまとめて更新する
  useEffect(() => {
    const underwaterBrightness = getUnderwaterBrightness(rainIntensity, cloudIntensity, isDay);
    const weatherOpacityTargets: [THREE.Material, number, number][] = [
      [fishSheenMaterial, FISH_DORSAL_SHEEN_OPACITY_MIN, FISH_DORSAL_SHEEN_OPACITY_MAX],
      [fishShadowMaterial, FISH_UNDERBODY_SHADOW_OPACITY_MIN, FISH_UNDERBODY_SHADOW_OPACITY_MAX],
      [fishEyeHighlightMaterial, FISH_EYE_HIGHLIGHT_OPACITY_MIN, FISH_EYE_HIGHLIGHT_OPACITY_MAX],
    ];
    for (const [material, min, max] of weatherOpacityTargets) {
      material.opacity = THREE.MathUtils.lerp(min, max, underwaterBrightness);
    }
  }, [
    cloudIntensity,
    fishEyeHighlightMaterial,
    fishShadowMaterial,
    fishSheenMaterial,
    isDay,
    rainIntensity,
  ]);

  const timeRef = useRef(0);
  const previousWaterSignalRef = useRef(waterSignal);
  const waterReactionStartedAtRef = useRef<number | null>(null);

  const normalFishMaterials = useLoader(MTLLoader, normalFishMtlUrl);
  normalFishMaterials.preload();
  const normalFishScene = useLoader(OBJLoader, normalFishObjUrl, (loader) => {
    loader.setMaterials(normalFishMaterials);
  });
  const flatfishScene = useModelScene("flatfish");

  const normalFishClones = useMemo(() => {
    return Array.from({ length: fishProfile.normalCount }, (_, index) => {
      const clone = normalFishScene.clone();
      applyLowPolyNormalFishMaterial(
        clone,
        fishList[index]?.color ?? fishProfile.fishColor,
        fishList[index]?.accentColor ?? fishProfile.fishAccentColor,
        fishList[index]?.colorPattern ?? "back"
      );
      return clone;
    });
  }, [fishList, fishProfile.fishAccentColor, fishProfile.fishColor, fishProfile.normalCount, normalFishScene]);

  const flatfishClones = useMemo(() => {
    return Array.from({ length: fishProfile.flatfishCount }, (_, index) => {
      const clone = flatfishScene.clone();
      applyLowPolyFlatfishMaterial(clone, index);
      return clone;
    });
  }, [fishProfile.flatfishCount, flatfishScene]);

  useEffect(() => {
    return () => {
      normalFishClones.forEach(disposeObjectMaterials);
    };
  }, [normalFishClones]);

  useEffect(() => {
    return () => {
      flatfishClones.forEach(disposeObjectMaterials);
    };
  }, [flatfishClones]);

  useEffect(() => {
    return () => {
      normalAccentGeometry.dispose();
      flatfishAccentGeometry.dispose();
      fishEyeGeometry.dispose();
      fishEyeHighlightGeometry.dispose();
      fishEyeMaterial.dispose();
      fishEyeHighlightMaterial.dispose();
      fishShadowGeometry.dispose();
      fishShadowMaterial.dispose();
      fishSheenGeometry.dispose();
      fishSheenMaterial.dispose();
    };
  }, [
    fishEyeGeometry,
    fishEyeHighlightGeometry,
    fishEyeHighlightMaterial,
    fishEyeMaterial,
    fishShadowGeometry,
    fishShadowMaterial,
    fishSheenGeometry,
    fishSheenMaterial,
    flatfishAccentGeometry,
    normalAccentGeometry,
  ]);

  // 各魚モデルの位置を動的に更新するための参照を作成する
  const fishRefs = useRef<THREE.Group[]>([]);
  const accentMaterialRefs = useRef<THREE.MeshStandardMaterial[]>([]);

  // useFrameを1つに統合してパフォーマンス向上
  // 状態更新を排除し、refのみを更新することで再レンダリングを削減
  useThrottledFrame((_, delta) => {
    timeRef.current += delta;

    if (waterSignal !== previousWaterSignalRef.current) {
      previousWaterSignalRef.current = waterSignal;
      waterReactionStartedAtRef.current = timeRef.current;
      fishList.forEach((fish, index) => {
        const directionJolt = fish.type === "flatfish" ? 0.22 : 0.58;
        const directionSign = index % 2 === 0 ? 1 : -1;
        fish.targetDirectionX += directionSign * directionJolt;
        fish.directionChangeTime = Math.min(fish.directionChangeTime, 0.8);
      });
    }

    const waterReactionAge =
      waterReactionStartedAtRef.current === null
        ? WATER_REACTION_SECONDS
        : timeRef.current - waterReactionStartedAtRef.current;
    const waterReactionStrength = Math.max(0, 1 - waterReactionAge / WATER_REACTION_SECONDS);

    // fishListの参照を直接変更（再レンダリングを避ける）
    fishList.forEach((fish, index) => {
      updateFishMovement(fish, {
        delta,
        elapsedTime: timeRef.current,
        weatherDepthOffset,
        weatherSpeedMultiplier,
        waterReactionStrength,
      });

      const ref = fishRefs.current[index];
      if (ref) {
        ref.position.set(fish.x, fish.y, fish.z);
        ref.rotation.set(
          0,
          fish.directionX + (fish.type === "flatfish" ? 0 : FISH_MODEL_ROTATION.DIRECTION_OFFSET),
          0
        );
      }

      const accentMaterial = accentMaterialRefs.current[index];
      if (accentMaterial) {
        const isFlatfish = fish.type === "flatfish";
        const baseOpacity = getFishAccentBaseOpacity(isFlatfish, fish.colorPattern);
        const baseGlow = getFishAccentBaseGlow(isFlatfish, fish.colorPattern);
        const weatherVisibilityBoost = rainIntensity * 0.08 + cloudIntensity * 0.04;
        const reactionBoost = waterReactionStrength * (isFlatfish ? 0.08 : 0.16);
        const pulse = Math.sin(timeRef.current * fish.accentPulseSpeed + fish.swimPhase) * 0.5 + 0.5;

        accentMaterial.opacity = THREE.MathUtils.clamp(
          baseOpacity + weatherVisibilityBoost + reactionBoost,
          0,
          1
        );
        accentMaterial.emissiveIntensity =
          baseGlow + reactionBoost * 0.9 + pulse * (isFlatfish ? 0.025 : 0.045);
      }
    });
  }, 30);

  return (
    <group>
      {fishList.map((fish, index) => {
        const isFlatfish = fish.type === "flatfish";
        const clonedModel = isFlatfish
          ? flatfishClones[index - fishProfile.normalCount]
          : normalFishClones[index];

        const scaleMultiplier = isFlatfish ? FISH_MODEL_SCALE.FLATFISH : FISH_MODEL_SCALE.NORMAL;
        const scale: [number, number, number] = [fish.size * scaleMultiplier, fish.size * scaleMultiplier, fish.size * scaleMultiplier];
        const rotation: [number, number, number] = isFlatfish
          ? [FISH_MODEL_ROTATION.FLATFISH, 0, 0]
          : [FISH_MODEL_ROTATION.NORMAL, 0, 0];
        const accentOpacity = getFishAccentBaseOpacity(isFlatfish, fish.colorPattern);
        const accentGlow = getFishAccentBaseGlow(isFlatfish, fish.colorPattern);
        const accentScale: [number, number, number] = isFlatfish
          ? [fish.size * 0.95, fish.size * 0.42, fish.size * 0.95]
          : [fish.size * 0.68, fish.size * 0.32, fish.size * 0.68];
        const eyePositions = isFlatfish ? FLATFISH_EYE_POSITIONS : NORMAL_FISH_EYE_POSITIONS;
        const eyeScale = fish.size * (isFlatfish ? 0.92 : 0.66);
        const shadowPosition = isFlatfish
          ? FLATFISH_UNDERBODY_SHADOW_POSITION
          : NORMAL_FISH_UNDERBODY_SHADOW_POSITION;
        const shadowScale: [number, number, number] = isFlatfish
          ? [fish.size * 0.95, fish.size * 0.34, 1]
          : [fish.size * 0.78, fish.size * 0.22, 1];
        const sheenPosition = isFlatfish
          ? FLATFISH_DORSAL_SHEEN_POSITION
          : NORMAL_FISH_DORSAL_SHEEN_POSITION;
        const sheenScale: [number, number, number] = isFlatfish
          ? [fish.size * 0.7, fish.size * 0.28, 1]
          : [fish.size * 0.58, fish.size * 0.16, 1];

        return (
          <group
            key={fish.id}
            ref={(el) => {
              if (el) {
                fishRefs.current[index] = el;
                // 初期位置を設定（一度だけ）
                if (el.position.x === 0 && el.position.y === 0 && el.position.z === 0) {
                  el.position.set(fish.x, fish.y, fish.z);
                  el.rotation.set(
                    0,
                    fish.directionX + (isFlatfish ? 0 : FISH_MODEL_ROTATION.DIRECTION_OFFSET),
                    0
                  );
                }
              }
            }}
          >
            <primitive
              object={clonedModel}
              scale={scale}
              rotation={rotation}
            />
            <mesh
              position={shadowPosition}
              rotation={FISH_UNDERBODY_SHADOW_ROTATION}
              scale={shadowScale}
              geometry={fishShadowGeometry}
              material={fishShadowMaterial}
            />
            <mesh
              position={sheenPosition}
              rotation={FISH_DORSAL_SHEEN_ROTATION}
              scale={sheenScale}
              geometry={fishSheenGeometry}
              material={fishSheenMaterial}
            />
            <mesh
              position={isFlatfish ? FLATFISH_MARK_POSITION : NORMAL_FISH_MARK_POSITION}
              rotation={isFlatfish ? FLATFISH_MARK_ROTATION : NORMAL_FISH_MARK_ROTATION}
              scale={accentScale}
              geometry={isFlatfish ? flatfishAccentGeometry : normalAccentGeometry}
            >
              <meshStandardMaterial
                ref={(material) => {
                  if (material) {
                    accentMaterialRefs.current[index] = material;
                  }
                }}
                color={fish.accentColor}
                emissive={fish.accentColor}
                emissiveIntensity={accentGlow}
                flatShading
                metalness={0}
                roughness={0.72}
                transparent
                opacity={accentOpacity}
                depthWrite={false}
              />
            </mesh>
            {eyePositions.map((eyePosition, eyeIndex) => (
              <group key={eyeIndex} position={eyePosition} scale={eyeScale}>
                <mesh geometry={fishEyeGeometry} material={fishEyeMaterial} />
                <mesh
                  position={[0.008, 0.006, eyePosition[2] > 0 ? 0.006 : -0.006]}
                  geometry={fishEyeHighlightGeometry}
                  material={fishEyeHighlightMaterial}
                />
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};

export default React.memo(FishManager);
