import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import autumnLeafModel from '../assets/cc0__deep_autumn__5k_followers_milestone.glb?url';

/**
 * 秋の落ち葉エフェクト
 * 3Dモデルの紅葉が水面に浮かぶ
 */
const FallenLeaves: React.FC = () => {
  const { season } = useSeason();
  const leavesRefs = useRef<THREE.Group[]>([]);

  // ローカルとCloudflare Workerのどちらを参照するかを環境変数で切り替え
  const isLocal = import.meta.env.VITE_ENVIRONMENT === "local";
  const leafUrl = isLocal
    ? autumnLeafModel
    : "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/cc0__deep_autumn__5k_followers_milestone.glb";

  const { scene: leafScene } = leafUrl
    ? useGLTF(leafUrl, true)
    : { scene: new THREE.Group() };

  // 落ち葉の初期位置データ（コンポーネント再レンダリング時に位置が変わらないようにuseMemoで固定）
  const leafData = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      x: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 10,
      rotationY: Math.random() * Math.PI * 2,
      scale: 0.03 + Math.random() * 0.02,
      floatSpeed: 0.3 + Math.random() * 0.4, // 浮き沈みの速度
      driftSpeed: 0.05 + Math.random() * 0.1, // 横移動の速度
      rotationSpeed: 0.2 + Math.random() * 0.3, // 回転速度
      phaseOffset: Math.random() * Math.PI * 2, // 位相オフセット
    }))
  , []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    leavesRefs.current.forEach((ref, i) => {
      if (ref) {
        const data = leafData[i];
        // 水面の揺れに合わせた浮き沈み
        ref.position.y = 8.05 + Math.sin(time * data.floatSpeed + data.phaseOffset) * 0.03;

        // ゆっくりとした横移動（水の流れ）
        ref.position.x = data.x + Math.sin(time * data.driftSpeed + data.phaseOffset) * 0.8;
        ref.position.z = data.z + Math.cos(time * data.driftSpeed * 0.7 + data.phaseOffset) * 0.5;

        // 水流による緩やかな回転
        ref.rotation.y = data.rotationY + time * data.rotationSpeed * 0.1;
        // わずかな傾き（波の影響）
        ref.rotation.x = Math.sin(time * 0.4 + data.phaseOffset) * 0.08;
        ref.rotation.z = Math.cos(time * 0.3 + data.phaseOffset) * 0.06;
      }
    });
  });

  if (season !== "autumn") {
    return null; // 秋の間だけ葉をレンダリング
  }

  return (
    <group>
      {leafData.map((data, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) leavesRefs.current[i] = el;
          }}
          position={[data.x, 8.05, data.z]}
          rotation={[0, data.rotationY, 0]}
          scale={[data.scale, data.scale, data.scale]}
        >
          <primitive object={leafScene.clone()} />
        </group>
      ))}
    </group>
  );
};

export default FallenLeaves;
