import React from "react";
import { useGLTF } from "@react-three/drei";

const KnobbedWhelk: React.FC = () => {
  return (
    <group>
      {/* ノブドウェルク1 - 地面に配置する */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[-0.5, -1, -0.5]} // 中心に近づける
        rotation={[0, 0, 0]}
        scale={[0.3, 0.3, 0.3]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク2 - 地面に配置する */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[0.5, -1, -0.3]} // 中心に近づける
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 0.25, 0.25]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク3 - 地面に配置する */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[-0.3, -1, 0.5]} // 中心に近づける
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 0.35, 0.35]} // 少し大きくするためにスケールを増やす
      />
      {/* ノブドウェルク4 - 地面に配置する */}
      <primitive
        object={useGLTF("/assets/Knobbed Whelk GLTF/scene.gltf").scene}
        position={[0.8, -1, -0.8]} // 中心に近づける
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 0.2, 0.2]} // 少し大きくするためにスケールを増やす
      />
    </group>
  );
};

export default KnobbedWhelk;
