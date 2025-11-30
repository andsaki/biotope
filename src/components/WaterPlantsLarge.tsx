import React, { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 大型水草コンポーネント
 * 季節に応じて色が変化する水中の水草と蓮の葉
 */
const WaterPlantsLarge: React.FC = () => {
  const { season } = useSeason();
  const lilyRefs = useRef<THREE.Group[]>([]);

  // R2から直接読み込み（ファイルサイズが大きいため）
  const lilyUrl = "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/cc0__water_lily_nymphaea_cv.glb";

  const { scene: lilyScene } = lilyUrl
    ? useGLTF(lilyUrl, true)
    : { scene: new THREE.Group() };

  // 蓮の葉のデータ（位置や位相オフセット）
  const lilyData = useMemo(() => [
    { position: [-4, 7.9, 1] as [number, number, number], rotation: 0, scale: 0.08, phaseOffset: 0 },
    { position: [3.5, 7.9, -0.5] as [number, number, number], rotation: Math.PI / 3, scale: 0.06, phaseOffset: 1.2 },
    { position: [0, 7.9, 2.5] as [number, number, number], rotation: Math.PI / 2, scale: 0.1, phaseOffset: 2.5 },
    { position: [-1.5, 7.9, -1.8] as [number, number, number], rotation: Math.PI / 6, scale: 0.07, phaseOffset: 3.8 },
  ], []);

  // 蓮の葉のアニメーション（水面の波に連動）
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // 水面の高さ（WaterSurface.tsxと同じ計算式）
    const waterHeight = 8 + Math.sin(time * 1.5) * 0.5;

    lilyRefs.current.forEach((ref, i) => {
      if (ref) {
        const data = lilyData[i];
        // 水面の波に完全に連動（各葉の位置での波紋を考慮）
        const localWave = Math.sin(data.position[0] * 0.3 + time * 2.5) *
                         Math.cos(data.position[2] * 0.3 + time * 2.5) * 0.05;
        ref.position.y = waterHeight + localWave;

        // わずかな回転（水流の影響）
        ref.rotation.y = data.rotation + Math.sin(time * 0.3 + data.phaseOffset) * 0.08;
        // わずかな傾き（波の傾斜に合わせて）
        ref.rotation.x = Math.sin(time * 1.5 + data.phaseOffset) * 0.03;
        ref.rotation.z = Math.cos(time * 1.5 + data.phaseOffset * 0.7) * 0.03;
      }
    });
  });

  // 季節ごとの水草の色
  const plantColor = useMemo(() => {
    switch (season) {
      case "spring":
        return "#4CAF50"; // 明るい新緑
      case "summer":
        return "#2E7D32"; // 濃い緑
      case "autumn":
        return "#558B2F"; // 黄緑がかった緑
      case "winter":
        return "#1B5E20"; // 暗い緑
      default:
        return "#1B5E20";
    }
  }, [season]);

  return (
    <group>
      {/* 水草1 - 地面に配置する */}
      <mesh
        position={[-3, -1, -2]}
        rotation={[0, 0, 0]}
        scale={[0.3, 2.0, 0.3]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color={plantColor} />
      </mesh>
      {/* 水草2 - 地面に配置する */}
      <mesh
        position={[2, -1, -1]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[0.25, 1.8, 0.25]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color={plantColor} />
      </mesh>
      {/* 水草3 - 地面に配置する */}
      <mesh
        position={[-2, -1, 2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 2.2, 0.35]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color={plantColor} />
      </mesh>
      {/* 水草4 - 地面に配置する */}
      <mesh
        position={[3, -1, -3]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[0.2, 1.5, 0.2]}
      >
        <cylinderGeometry args={[0.1, 0.3, 1, 8]} />
        <meshStandardMaterial color={plantColor} />
      </mesh>

      {/* 蓮の葉 - 夏だけ水面付近に配置 */}
      {season === "summer" && lilyData.map((data, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) lilyRefs.current[i] = el;
          }}
          position={data.position}
          rotation={[0, data.rotation, 0]}
          scale={[data.scale, data.scale, data.scale]}
        >
          <primitive object={lilyScene.clone()} />
        </group>
      ))}
    </group>
  );
};

export default WaterPlantsLarge;
