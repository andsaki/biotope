import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import fishModel from '../assets/Smoked Fish Raw/weflciqaa_tier_0.gltf?url';

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
}

/**
 * 魚群の管理コンポーネント
 * 季節に応じた色と速度で複数の魚をアニメーション
 */
const FishManager: React.FC = () => {
  const { season } = useSeason();
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
      });
    }
    setFishList(newFishList);
  }, [season]);

  const timeRef = React.useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;

    setFishList((prevFishList) =>
      prevFishList.map((fish) => {
        let newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * 60;
        let newY = fish.y + Math.sin(fish.directionY) * fish.speed * delta * 60;
        let newZ =
          fish.z + Math.sin(fish.directionX) * fish.speed * 0.2 * delta * 60; // Z方向の動きの影響を減らす
        // Z位置をクランプして、地面より少し上から始まるボックス内に収まるようにする
        newZ = Math.max(-1.5, Math.min(3.0, newZ));

        // 泳ぐ動きを模倣するためにわずかな垂直振動を追加する
        newY += Math.sin(timeRef.current * 2 + fish.id) * 0.01;

        // 境界チェック - 垂直に拡大し、水平に縮小したボックスの境界を厳密に適用する
        if (newX < -6.0 || newX > 6.0) {
          fish.directionX = Math.PI - fish.directionX;
          newX = Math.max(-6.0, Math.min(6.0, newX)); // 水平に縮小したボックス境界にクランプする
        }
        if (newY < 0.0 || newY > 8.0) {
          fish.directionY = -fish.directionY;
          newY = Math.max(0.0, Math.min(8.0, newY)); // 底面がY=0より上で上面がさらに下がったボックス境界にクランプする
        }
        if (newZ < -1.5 || newZ > 3.0) {
          // 地面より少し上から始まるボックスの垂直範囲内に魚を保持するように調整する
          fish.directionX = Math.PI - fish.directionX;
          newZ = Math.max(-1.5, Math.min(3.0, newZ)); // 地面より少し上から始まるボックス境界にクランプする
        }

        // ランダムな方向変更 - よりスムーズな動きのために頻度を減らす
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
  const modelUrl = isLocal
    ? fishModel
    : "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf";
  const { scene } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };

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
        ref.rotation.set(0, fish.directionX + Math.PI / 2, 0);
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
      {fishList.map((fish, index) => (
        <group
          key={fish.id}
          ref={(el) => (fishRefs.current[index] = el as THREE.Group)}
        >
          <primitive
            object={scene.clone()}
            scale={[fish.size * 10, fish.size * 10, fish.size * 10]} // 最大限の視認性のために非常に大きなスケールにする
            rotation={[Math.PI / 2, 0, 0]} // X軸の回転を調整して正しい向きにする
            // オリジナルのモデルテクスチャを保持するためにマテリアルの上書きを削除する
          />
          {/* GLTFモデルに焦点を当てるために一時的にフォールバックを非表示にする */}
          {/* <mesh>
            <boxGeometry
              args={[fish.size * 0.5, fish.size * 0.3, fish.size * 0.15]}
            />
            <meshPhongMaterial
              color={fish.color}
              shininess={100}
              specular="#666"
            />
          </mesh> */}
        </group>
      ))}
    </group>
  );
};

export default FishManager;
