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
  NORMAL_FISH_COUNT,
  FLATFISH_COUNT,
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

/**
 * 魚群の管理コンポーネント
 * 季節に応じた色と速度で複数の魚をアニメーション
 */
interface FishManagerProps {
  weather: WeatherSnapshot;
  waterSignal: number;
}

const WATER_REACTION_SECONDS = 2.2;

const FishManager: React.FC<FishManagerProps> = ({ weather, waterSignal }) => {
  const { season } = useSeason();
  const rainIntensity = getRainIntensity(weather);
  const cloudIntensity = getCloudIntensity(weather);
  const weatherSpeedMultiplier = 1.08 - rainIntensity * 0.34 - cloudIntensity * 0.12;
  const temperatureDepthOffset = weather.temperature >= 27 ? -0.28 : weather.temperature <= 8 ? -0.16 : 0;
  const weatherDepthOffset = -(rainIntensity * 0.55 + cloudIntensity * 0.18) + temperatureDepthOffset;

  const fishList = useMemo(() => createFishList(season), [season]);
  const fishProfile = useMemo(() => getSeasonFishProfile(season), [season]);

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
    return Array.from({ length: NORMAL_FISH_COUNT }, (_, index) => {
      const clone = normalFishScene.clone();
      applyLowPolyNormalFishMaterial(
        clone,
        fishProfile.fishColor,
        fishProfile.fishAccentColor,
        index
      );
      return clone;
    });
  }, [fishProfile.fishAccentColor, fishProfile.fishColor, normalFishScene]);

  const flatfishClones = useMemo(() => {
    return Array.from({ length: FLATFISH_COUNT }, (_, index) => {
      const clone = flatfishScene.clone();
      applyLowPolyFlatfishMaterial(clone, index);
      return clone;
    });
  }, [flatfishScene]);

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

  // 各魚モデルの位置を動的に更新するための参照を作成する
  const fishRefs = useRef<THREE.Group[]>([]);

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
    });
  }, 30);

  return (
    <group>
      {fishList.map((fish, index) => {
        const isFlatfish = fish.type === "flatfish";
        const clonedModel = isFlatfish
          ? flatfishClones[index - NORMAL_FISH_COUNT]
          : normalFishClones[index];

        const scaleMultiplier = isFlatfish ? FISH_MODEL_SCALE.FLATFISH : FISH_MODEL_SCALE.NORMAL;
        const scale: [number, number, number] = [fish.size * scaleMultiplier, fish.size * scaleMultiplier, fish.size * scaleMultiplier];
        const rotation: [number, number, number] = isFlatfish
          ? [FISH_MODEL_ROTATION.FLATFISH, 0, 0]
          : [FISH_MODEL_ROTATION.NORMAL, 0, 0];

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
          </group>
        );
      })}
    </group>
  );
};

export default React.memo(FishManager);
