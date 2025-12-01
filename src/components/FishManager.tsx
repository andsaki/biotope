import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useTime } from "../contexts/TimeContext";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import fishModel from '../assets/Smoked Fish Raw/weflciqaa_tier_0.gltf?url';

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
  const { isDay } = useTime();
  const [fishList, setFishList] = useState<Fish[]>([]);

  useEffect(() => {
    // 季節に基づいて魚を初期化する
    const newFishList: Fish[] = [];
    let fishSpeed: number;
    let fishColor: string;
    const fishCount = 10;

    switch (season) {
      case "spring":
        fishSpeed = 0.015; // より穏やかな動きのために速度をさらに減らす
        fishColor = "#FF6347"; // トマト
        break;
      case "summer":
        fishSpeed = 0.02; // より穏やかな動きのために速度をさらに減らす
        fishColor = "#FF4500"; // オレンジレッド
        break;
      case "autumn":
        fishSpeed = 0.01; // より穏やかな動きのために速度をさらに減らす
        fishColor = "#DAA520"; // ゴールデンロッド
        break;
      case "winter":
        fishSpeed = 0.005; // より穏やかな動きのために速度をさらに減らす
        fishColor = "#4682B4"; // スティールブルー
        break;
      default:
        fishSpeed = 0.015; // より穏やかな動きのために速度をさらに減らす
        fishColor = "#FF6347";
    }

    // 通常の魚を追加
    for (let i = 0; i < fishCount; i++) {
      newFishList.push({
        id: i,
        x: Math.random() * 10 - 5,
        y: Math.random() * 8 + 0.0, // Y=0から上向きに開始し、上面をさらに下げるように調整する
        z: Math.random() * 4.5 - 1.5, // 地面より少し上から始まるボックス空間を利用するように調整する
        speed: fishSpeed + (Math.random() * 0.02 - 0.01),
        directionX: Math.random() * Math.PI * 2,
        directionY: Math.random() * Math.PI * 2,
        color: fishColor,
        size: 0.2 + Math.random() * 0.3,
        type: "normal",
      });
    }

    // フラットフィッシュ（底生魚）を追加
    const flatfishCount = 3;
    for (let i = 0; i < flatfishCount; i++) {
      newFishList.push({
        id: fishCount + i,
        x: Math.random() * 10 - 5,
        y: -0.9, // 地面（Y=-1）のすぐ上に密着
        z: Math.random() * 4.5 - 1.5,
        speed: 0.2, // 瞬間移動時の速度
        directionX: Math.random() * Math.PI * 2,
        directionY: 0, // 底生魚は垂直方向にはほとんど動かない
        color: fishColor,
        size: 1.5 + Math.random() * 0.5, // サイズを大きく
        type: "flatfish",
        waitTime: 10 + Math.random() * 10, // 10〜20秒待機（砂に擬態）
        isMoving: false,
      });
    }
    setFishList(newFishList);
  }, [season]);

  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;

    setFishList((prevFishList) =>
      prevFishList.map((fish) => {
        // フラットフィッシュ：カレイらしい「待機→瞬間移動→待機」の動き
        if (fish.type === "flatfish") {
          let newWaitTime = fish.waitTime ?? 0;
          let newIsMoving = fish.isMoving ?? false;
          let newX = fish.x;
          let newZ = fish.z;
          const newY = -0.9; // 地面に密着

          newWaitTime -= delta;

          if (newWaitTime <= 0) {
            if (!newIsMoving) {
              // 待機終了 → 移動開始
              newIsMoving = true;
              fish.directionX = Math.random() * Math.PI * 2;
              newWaitTime = 0.3 + Math.random() * 0.2; // 0.3〜0.5秒移動（短く素早く）
            } else {
              // 移動終了 → 待機開始（砂に擬態）
              newIsMoving = false;
              newWaitTime = 10 + Math.random() * 10; // 10〜20秒待機
            }
          }

          // 移動中のみ位置を更新
          if (newIsMoving) {
            newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * 60;
            newZ = fish.z + Math.sin(fish.directionX) * fish.speed * delta * 60;

            // 境界チェック
            if (newX < -6.0 || newX > 6.0) {
              fish.directionX = Math.PI - fish.directionX;
              newX = Math.max(-6.0, Math.min(6.0, newX));
            }
            if (newZ < -1.5 || newZ > 3.0) {
              fish.directionX = Math.PI - fish.directionX;
              newZ = Math.max(-1.5, Math.min(3.0, newZ));
            }
          }

          return { ...fish, x: newX, y: newY, z: newZ, waitTime: newWaitTime, isMoving: newIsMoving };
        }

        // 通常の魚：従来通りの動き
        let newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * 60;
        let newY = fish.y + Math.sin(fish.directionY) * fish.speed * delta * 60;
        let newZ =
          fish.z + Math.sin(fish.directionX) * fish.speed * 0.2 * delta * 60;
        newZ = Math.max(-1.5, Math.min(3.0, newZ));

        // 通常の魚：泳ぐ動きを模倣するためにわずかな垂直振動を追加する
        newY += Math.sin(timeRef.current * 2 + fish.id) * 0.01;

        // 境界チェック
        if (newX < -6.0 || newX > 6.0) {
          fish.directionX = Math.PI - fish.directionX;
          newX = Math.max(-6.0, Math.min(6.0, newX));
        }
        if (newY < 0.0 || newY > 8.0) {
          fish.directionY = -fish.directionY;
          newY = Math.max(0.0, Math.min(8.0, newY));
        }
        if (newZ < -1.5 || newZ > 3.0) {
          fish.directionX = Math.PI - fish.directionX;
          newZ = Math.max(-1.5, Math.min(3.0, newZ));
        }

        // ランダムな方向変更
        if (Math.random() < 0.005) {
          fish.directionX += (Math.random() * Math.PI) / 4 - Math.PI / 8;
          fish.directionY += (Math.random() * Math.PI) / 4 - Math.PI / 8;
        }

        return { ...fish, x: newX, y: newY, z: newZ };
      })
    );
  });

  // ローカルとCloudflare Workerのどちらを参照するかを環境変数で切り替え
  const isLocal = import.meta.env.VITE_ENVIRONMENT === "local";
  const normalFishUrl = isLocal
    ? fishModel
    : "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf";
  const flatfishUrl = "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/cc0____yellow_striped_flounder.glb";

  console.log("Loading flatfish from:", flatfishUrl);

  const { scene: normalFishScene } = normalFishUrl
    ? useGLTF(normalFishUrl, true)
    : { scene: new THREE.Group() };
  const { scene: flatfishScene } = flatfishUrl
    ? useGLTF(flatfishUrl, true)
    : { scene: new THREE.Group() };

  console.log("Flatfish scene loaded:", flatfishScene);

  // デバッグのためにモデルの読み込み成功とシーンの詳細をログする（コメントアウト）
  // useEffect(() => {
  //   console.log("GLTF model loaded successfully:", scene);
  //   console.log("Scene children:", scene.children);
  // }, [scene]);

  // 各魚の位置を動的に更新するための参照を作成する
  const fishRefs = React.useRef<THREE.Group[]>([]);

  useEffect(() => {
    fishRefs.current = fishList.map(() => new THREE.Group());
  }, [fishList.length]);

  useFrame(() => {
    fishRefs.current.forEach((ref, index) => {
      const fish = fishList[index];
      if (ref && fish) {
        ref.position.set(fish.x, fish.y, fish.z);
        // より自然な見た目のために移動方向に回転を合わせるようにする
        if (fish.type === "flatfish") {
          // フラットフィッシュは移動方向に頭を向ける
          ref.rotation.set(0, fish.directionX, 0);
        } else {
          ref.rotation.set(0, fish.directionX + Math.PI / 2, 0);
        }
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
        const scene = fish.type === "flatfish" ? flatfishScene : normalFishScene;
        const scale = fish.type === "flatfish"
          ? [fish.size * 0.05, fish.size * 0.05, fish.size * 0.05] // フラットフィッシュを大きく
          : [fish.size * 10, fish.size * 10, fish.size * 10];
        const rotation = fish.type === "flatfish"
          ? [0, 0, 0] // フラットフィッシュは水平に配置
          : [Math.PI / 2, 0, 0]; // 通常の魚は垂直方向に調整

        // フラットフィッシュの透明度調整
        // 待機中（砂に擬態）は薄く、移動中ははっきり見える
        // 夜はさらに暗く
        const opacity = fish.type === "flatfish"
          ? (!isDay ? 0.3 : (fish.isMoving ? 0.9 : 0.6))
          : 1.0;

        return (
          <group
            key={fish.id}
            ref={(el) => {
              fishRefs.current[index] = el as THREE.Group;
              // フラットフィッシュの夜間の明るさ調整
              if (el && fish.type === "flatfish") {
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
            }}
          >
            <primitive
              object={scene.clone()}
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
