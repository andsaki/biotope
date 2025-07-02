import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const KnobbedWhelk: React.FC = () => {
  // 注意: Cloudflare R2または他のストレージサービスにアップロードしたGLTFファイルと関連するBINファイルを参照するために、
  // 以下のURLを実際のストレージサービスのURLに置き換えてください。
  // 例: "https://<account-id>.r2.cloudflarestorage.com/biotope-assets/scene.gltf"
  // 一時的にモデル読み込みを無効にしてエラーを防ぎます。実際のURLに置き換えてください。
  const modelUrl = ""; // 実際のURLをここに設定してください。
  const { scene: whelkScene1 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: whelkScene2 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: whelkScene3 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };
  const { scene: whelkScene4 } = modelUrl
    ? useGLTF(modelUrl, true)
    : { scene: new THREE.Group() };

  return (
    <group>
      {/* ノブドウェルク1 - 地面に配置する */}
      <primitive
        object={whelkScene1}
        position={[-0.5, -1, -0.5]} // 中心に近づける
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク2 - 地面に配置する */}
      <primitive
        object={whelkScene2}
        position={[0.5, -1, -0.3]} // 中心に近づける
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク3 - 地面に配置する */}
      <primitive
        object={whelkScene3}
        position={[-0.3, -1, 0.5]} // 中心に近づける
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク4 - 地面に配置する */}
      <primitive
        object={whelkScene4}
        position={[0.8, -1, -0.8]} // 中心に近づける
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]} // 少し大きくするためにスケールを増やす
      />
    </group>
  );
};

export default KnobbedWhelk;
