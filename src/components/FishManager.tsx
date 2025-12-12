import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useDayPeriod } from "../contexts/TimeContext";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useModelScene } from "../hooks/useModelScene";
import {
  NORMAL_FISH_COUNT,
  FLATFISH_COUNT,
  FISH_SPEED,
  FISH_COLOR,
  NORMAL_FISH_SPAWN,
  NORMAL_FISH_SPEED_VARIATION,
  NORMAL_FISH_SIZE_MIN,
  NORMAL_FISH_SIZE_VARIATION,
  FLATFISH_GROUND_Y,
  FLATFISH_SPEED,
  FLATFISH_SIZE_MIN,
  FLATFISH_SIZE_VARIATION,
  FLATFISH_WAIT_TIME_MIN,
  FLATFISH_WAIT_TIME_VARIATION,
  FLATFISH_MOVE_TIME_MIN,
  FLATFISH_MOVE_TIME_VARIATION,
  FISH_MOVEMENT,
  FISH_BOUNDARY,
  FISH_MODEL_SCALE,
  FISH_MODEL_ROTATION,
  FLATFISH_OPACITY,
  NORMAL_FISH_OPACITY,
} from "../constants/fish";

/** 魚の種類 */
type FishType = "normal" | "flatfish";

/** 魚の状態データ */
interface Fish {
  /** 魚のID */
  id: number;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** Z座標 */
  z: number;
  /** 移動速度 */
  speed: number;
  /** X方向の移動方向 */
  directionX: number;
  /** Y方向の移動方向 */
  directionY: number;
  /** 魚の色 */
  color: string;
  /** 魚のサイズ */
  size: number;
  /** 魚の種類 */
  type: FishType;
  /** フラットフィッシュの待機時間（秒） */
  waitTime?: number;
  /** フラットフィッシュが移動中かどうか */
  isMoving?: boolean;
}

/**
 * 魚群の管理コンポーネント
 * 季節に応じた色と速度で複数の魚をアニメーション
 */
const FishManager: React.FC = () => {
  const { season } = useSeason();
  const isDay = useDayPeriod();
  const [fishList, setFishList] = useState<Fish[]>([]);

  useEffect(() => {
    // 季節に基づいて魚を初期化する
    const newFishList: Fish[] = [];
    let fishSpeed: number;
    let fishColor: string;

    switch (season) {
      case "spring":
        fishSpeed = FISH_SPEED.SPRING;
        fishColor = FISH_COLOR.SPRING;
        break;
      case "summer":
        fishSpeed = FISH_SPEED.SUMMER;
        fishColor = FISH_COLOR.SUMMER;
        break;
      case "autumn":
        fishSpeed = FISH_SPEED.AUTUMN;
        fishColor = FISH_COLOR.AUTUMN;
        break;
      case "winter":
        fishSpeed = FISH_SPEED.WINTER;
        fishColor = FISH_COLOR.WINTER;
        break;
      default:
        fishSpeed = FISH_SPEED.DEFAULT;
        fishColor = FISH_COLOR.DEFAULT;
    }

    // 通常の魚を追加
    for (let i = 0; i < NORMAL_FISH_COUNT; i++) {
      newFishList.push({
        id: i,
        x: Math.random() * (NORMAL_FISH_SPAWN.X_MAX - NORMAL_FISH_SPAWN.X_MIN) + NORMAL_FISH_SPAWN.X_MIN,
        y: Math.random() * (NORMAL_FISH_SPAWN.Y_MAX - NORMAL_FISH_SPAWN.Y_MIN) + NORMAL_FISH_SPAWN.Y_MIN,
        z: Math.random() * (NORMAL_FISH_SPAWN.Z_MAX - NORMAL_FISH_SPAWN.Z_MIN) + NORMAL_FISH_SPAWN.Z_MIN,
        speed: fishSpeed + (Math.random() * NORMAL_FISH_SPEED_VARIATION - NORMAL_FISH_SPEED_VARIATION / 2),
        directionX: Math.random() * Math.PI * 2,
        directionY: Math.random() * Math.PI * 2,
        color: fishColor,
        size: NORMAL_FISH_SIZE_MIN + Math.random() * NORMAL_FISH_SIZE_VARIATION,
        type: "normal",
      });
    }

    // フラットフィッシュ（底生魚）を追加
    for (let i = 0; i < FLATFISH_COUNT; i++) {
      newFishList.push({
        id: NORMAL_FISH_COUNT + i,
        x: Math.random() * (NORMAL_FISH_SPAWN.X_MAX - NORMAL_FISH_SPAWN.X_MIN) + NORMAL_FISH_SPAWN.X_MIN,
        y: FLATFISH_GROUND_Y,
        z: Math.random() * (NORMAL_FISH_SPAWN.Z_MAX - NORMAL_FISH_SPAWN.Z_MIN) + NORMAL_FISH_SPAWN.Z_MIN,
        speed: FLATFISH_SPEED,
        directionX: Math.random() * Math.PI * 2,
        directionY: 0,
        color: fishColor,
        size: FLATFISH_SIZE_MIN + Math.random() * FLATFISH_SIZE_VARIATION,
        type: "flatfish",
        waitTime: FLATFISH_WAIT_TIME_MIN + Math.random() * FLATFISH_WAIT_TIME_VARIATION,
        isMoving: false,
      });
    }
    setFishList(newFishList);
  }, [season]);

  const timeRef = React.useRef(0);

  const normalFishScene = useModelScene("normalFish");
  const flatfishScene = useModelScene("flatfish");

  // モデルのクローンを事前に作成してパフォーマンス向上
  const normalFishClones = React.useMemo(() => {
    return Array.from({ length: NORMAL_FISH_COUNT }, () => normalFishScene.clone());
  }, [normalFishScene]);

  const flatfishClones = React.useMemo(() => {
    return Array.from({ length: FLATFISH_COUNT }, () => flatfishScene.clone());
  }, [flatfishScene]);

  // 各魚の位置を動的に更新するための参照を作成する
  const fishRefs = React.useRef<THREE.Group[]>([]);

  // useFrameを1つに統合してパフォーマンス向上
  // 状態更新を排除し、refのみを更新することで再レンダリングを削減
  useFrame((_, delta) => {
    timeRef.current += delta;

    // fishListの参照を直接変更（再レンダリングを避ける）
    fishList.forEach((fish, index) => {
      // フラットフィッシュ：カレイらしい「待機→瞬間移動→待機」の動き
      if (fish.type === "flatfish") {
        let newWaitTime = fish.waitTime ?? 0;
        let newIsMoving = fish.isMoving ?? false;
        let newX = fish.x;
        let newZ = fish.z;
        const newY = FLATFISH_GROUND_Y;

        newWaitTime -= delta;

        if (newWaitTime <= 0) {
          if (!newIsMoving) {
            // 待機終了 → 移動開始
            newIsMoving = true;
            fish.directionX = Math.random() * Math.PI * 2;
            newWaitTime = FLATFISH_MOVE_TIME_MIN + Math.random() * FLATFISH_MOVE_TIME_VARIATION;
          } else {
            // 移動終了 → 待機開始（砂に擬態）
            newIsMoving = false;
            newWaitTime = FLATFISH_WAIT_TIME_MIN + Math.random() * FLATFISH_WAIT_TIME_VARIATION;
          }
        }

        // 移動中のみ位置を更新
        if (newIsMoving) {
          newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
          newZ = fish.z + Math.sin(fish.directionX) * fish.speed * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;

          // 境界チェック
          if (newX < FISH_BOUNDARY.X_MIN || newX > FISH_BOUNDARY.X_MAX) {
            fish.directionX = Math.PI - fish.directionX;
            newX = Math.max(FISH_BOUNDARY.X_MIN, Math.min(FISH_BOUNDARY.X_MAX, newX));
          }
          if (newZ < FISH_BOUNDARY.Z_MIN || newZ > FISH_BOUNDARY.Z_MAX) {
            fish.directionX = Math.PI - fish.directionX;
            newZ = Math.max(FISH_BOUNDARY.Z_MIN, Math.min(FISH_BOUNDARY.Z_MAX, newZ));
          }
        }

        // データを直接変更
        fish.x = newX;
        fish.y = newY;
        fish.z = newZ;
        fish.waitTime = newWaitTime;
        fish.isMoving = newIsMoving;

        // 参照も同時に更新
        const ref = fishRefs.current[index];
        if (ref) {
          ref.position.set(newX, newY, newZ);
          ref.rotation.set(0, fish.directionX, 0);
        }
        return;
      }

      // 通常の魚：従来通りの動き
      let newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
      let newY = fish.y + Math.sin(fish.directionY) * fish.speed * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
      let newZ =
        fish.z + Math.sin(fish.directionX) * fish.speed * FISH_MOVEMENT.Z_DRIFT_DAMPING * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
      newZ = Math.max(FISH_BOUNDARY.Z_MIN, Math.min(FISH_BOUNDARY.Z_MAX, newZ));

      // 通常の魚：泳ぐ動きを模倣するためにわずかな垂直振動を追加する
      newY += Math.sin(timeRef.current * FISH_MOVEMENT.SWIM_OSCILLATION_SPEED + fish.id) * FISH_MOVEMENT.SWIM_OSCILLATION_AMPLITUDE;

      // 境界チェック
      if (newX < FISH_BOUNDARY.X_MIN || newX > FISH_BOUNDARY.X_MAX) {
        fish.directionX = Math.PI - fish.directionX;
        newX = Math.max(FISH_BOUNDARY.X_MIN, Math.min(FISH_BOUNDARY.X_MAX, newX));
      }
      if (newY < FISH_BOUNDARY.Y_MIN || newY > FISH_BOUNDARY.Y_MAX) {
        fish.directionY = -fish.directionY;
        newY = Math.max(FISH_BOUNDARY.Y_MIN, Math.min(FISH_BOUNDARY.Y_MAX, newY));
      }
      if (newZ < FISH_BOUNDARY.Z_MIN || newZ > FISH_BOUNDARY.Z_MAX) {
        fish.directionX = Math.PI - fish.directionX;
        newZ = Math.max(FISH_BOUNDARY.Z_MIN, Math.min(FISH_BOUNDARY.Z_MAX, newZ));
      }

      // ランダムな方向変更
      if (Math.random() < FISH_MOVEMENT.DIRECTION_CHANGE_PROBABILITY) {
        fish.directionX += (Math.random() * FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE) - FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_OFFSET;
        fish.directionY += (Math.random() * FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE) - FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_OFFSET;
      }

      // データを直接変更
      fish.x = newX;
      fish.y = newY;
      fish.z = newZ;

      // 参照も同時に更新
      const ref = fishRefs.current[index];
      if (ref) {
        ref.position.set(newX, newY, newZ);
        ref.rotation.set(0, fish.directionX + FISH_MODEL_ROTATION.DIRECTION_OFFSET, 0);
      }
    });
  });

  // デバッグのために位置をログする（コメントアウト）
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (fishList.length > 0) {
  //       console.log(
  //         "Fish positions:",
  //         fishList.map((f) => ({ x: f.x, y: f.y, z: f.z }))
  //       );
  //     }
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, [fishList]);

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

        // フラットフィッシュの透明度調整
        // 待機中（砂に擬態）は薄く、移動中ははっきり見える
        // 夜はさらに暗く
        const opacity = isFlatfish
          ? (!isDay ? FLATFISH_OPACITY.NIGHT : (fish.isMoving ? FLATFISH_OPACITY.MOVING_DAY : FLATFISH_OPACITY.WAITING_DAY))
          : NORMAL_FISH_OPACITY;

        return (
          <group
            key={fish.id}
            ref={(el) => {
              if (el) {
                fishRefs.current[index] = el as THREE.Group;
                // 初期位置を設定（一度だけ）
                if (el.position.x === 0 && el.position.y === 0 && el.position.z === 0) {
                  el.position.set(fish.x, fish.y, fish.z);
                  el.rotation.set(
                    0,
                    fish.directionX + (isFlatfish ? 0 : FISH_MODEL_ROTATION.DIRECTION_OFFSET),
                    0
                  );
                }

                // フラットフィッシュの夜間の明るさ調整
                if (isFlatfish) {
                  el.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                      const mesh = child as THREE.Mesh;
                      const material = mesh.material as THREE.Material;
                      if (material) {
                        material.opacity = opacity;
                        material.transparent = true;
                      }
                    }
                  });
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

export default FishManager;
