import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const WaterPlants: React.FC = () => {
  // ローカルとCloudflare Workerのどちらを参照するかを環境変数で切り替え
  const isLocal = import.meta.env.VITE_ENVIRONMENT === "local";
  const baseUrl = isLocal
    ? "/assets/Potted Plant 1/"
    : "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/";
  const modelUrl = isLocal
    ? `${baseUrl}scene.gltf` // ローカル環境での実際のファイル名
    : `${baseUrl}potted-plant-1-scene.gltf`; // Cloudflare Worker経由でR2資産を読み込む
  const { scene: plantScene1 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: plantScene2 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: plantScene3 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: plantScene4 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };

  return (
    <group>
      {/* 水草1 - Potted Plant 1モデルを使用する */}
      <primitive
        object={plantScene1}
        position={[-2, -1, -1]}
        rotation={[0, 0, 0]}
        scale={[0.1, 0.1, 0.1]} // さらに小さくするためにスケールを減らす
      />
      {/* 水草2 - Potted Plant 1モデルを使用する */}
      <primitive
        object={plantScene2}
        position={[1, -1, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.075, 0.075, 0.075]} // さらに小さくするためにスケールを減少
      />
      {/* 水草3 - Potted Plant 1モデルを使用する */}
      <primitive
        object={plantScene3}
        position={[-1, -1, 1]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.125, 0.125, 0.125]} // さらに小さくするためにスケールを減少
      />
      {/* 水草4 - Potted Plant 1モデルを使用する */}
      <primitive
        object={plantScene4}
        position={[2, -1, -2]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.05, 0.05, 0.05]} // さらに小さくするためにスケールを減少
      />
    </group>
  );
};

export default WaterPlants;
