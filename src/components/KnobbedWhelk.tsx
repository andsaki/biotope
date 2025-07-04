import React from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const KnobbedWhelk: React.FC = () => {
  // ローカルとCloudflare Workerのどちらを参照するかを環境変数で切り替え
  // Temporarily use local file path to bypass Cloudflare Worker issue
  const baseUrl = "/assets/Knobbed Whelk GLTF/";
  const modelUrl = `${baseUrl}scene.gltf`; // Use local file path regardless of environment
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
