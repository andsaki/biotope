import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PottedPlant: React.FC = () => {
  const plant1Ref = useRef<THREE.Group>(null!);
  const plant2Ref = useRef<THREE.Group>(null!);
  const plant3Ref = useRef<THREE.Group>(null!);
  const plant4Ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // 各植物にわずかな揺れを追加し、微妙な変化をつける
    if (plant1Ref.current) {
      plant1Ref.current.rotation.z = Math.sin(time * 0.5) * 0.05;
    }
    if (plant2Ref.current) {
      plant2Ref.current.rotation.z = Math.sin(time * 0.6 + 1) * 0.04;
    }
    if (plant3Ref.current) {
      plant3Ref.current.rotation.z = Math.sin(time * 0.4 + 2) * 0.06;
    }
    if (plant4Ref.current) {
      plant4Ref.current.rotation.z = Math.sin(time * 0.7 + 3) * 0.03;
    }
  });

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
      {/* 鉢植え植物1 - 地面上でさらに遠くに配置 */}
      <primitive
        ref={plant1Ref}
        object={plantScene1}
        position={[-6, -1, -5]}
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* 鉢植え植物2 - 地面上でさらに遠くに配置 */}
      <primitive
        ref={plant2Ref}
        object={plantScene2}
        position={[6, -1, -4]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* 鉢植え植物3 - 地面上でさらに遠くに配置 */}
      <primitive
        ref={plant3Ref}
        object={plantScene3}
        position={[-5, -1, 5]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]}
        castShadow={true}
        receiveShadow={true}
      />
      {/* 鉢植え植物4 - 地面上でさらに遠くに配置 */}
      <primitive
        ref={plant4Ref}
        object={plantScene4}
        position={[7, -1, -6]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]}
        castShadow={true}
        receiveShadow={true}
      />
    </group>
  );
};

export default PottedPlant;
