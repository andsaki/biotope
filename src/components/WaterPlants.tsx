import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const WaterPlants: React.FC = () => {
  // 注意: Cloudflare R2または他のストレージサービスにアップロードしたGLTFファイルと関連するBINファイルを参照するために、
  // 以下のURLを実際のストレージサービスのURLに置き換えてください。
  // 例: "https://<account-id>.r2.cloudflarestorage.com/biotope-assets/scene.gltf"
  // 一時的にモデル読み込みを無効にしてエラーを防ぎます。実際のURLに置き換えてください。
  const modelUrl = ""; // 実際のURLをここに設定してください。
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
