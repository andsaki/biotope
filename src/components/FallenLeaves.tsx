import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import {
  LEAF_COUNT,
  LEAF_SPREAD_X,
  LEAF_SPREAD_Z,
  LEAF_BASE_SCALE,
  LEAF_SCALE_VARIATION,
  LEAF_FLOAT_SPEED_BASE,
  LEAF_FLOAT_SPEED_VARIATION,
  LEAF_DRIFT_SPEED_BASE,
  LEAF_DRIFT_SPEED_VARIATION,
  LEAF_ROTATION_SPEED_BASE,
  LEAF_ROTATION_SPEED_VARIATION,
  LEAF_GROUND_TILT,
  WATER_SURFACE_Y,
  GROUND_Y,
  WINTER_FLATTEN_SCALE,
} from "../constants/fallenLeaves";

/**
 * 秋・冬の落ち葉エフェクト
 * 秋: 3Dモデルの紅葉が水面に浮かぶ
 * 冬: 落ち葉が地面に落ちて静止
 */
const FallenLeaves: React.FC = React.memo(() => {
  const { season } = useSeason();
  const leavesRefs = useRef<THREE.Group[]>([]);

  // R2から直接読み込み（ファイルサイズが大きいため）
  const leafUrl = "https://biotope-r2-worker.ruby-on-rails-api.workers.dev/assets/cc0__deep_autumn__5k_followers_milestone.glb";

  const { scene: leafScene } = useGLTF(leafUrl, true);

  const isWinter = season === "winter";

  // 落ち葉の初期位置データ（コンポーネント再レンダリング時に位置が変わらないようにuseMemoで固定）
  const leafData = useMemo(() =>
    Array.from({ length: LEAF_COUNT }, () => ({
      x: (Math.random() - 0.5) * LEAF_SPREAD_X,
      z: (Math.random() - 0.5) * LEAF_SPREAD_Z,
      rotationY: Math.random() * Math.PI * 2,
      rotationX: Math.random() * LEAF_GROUND_TILT - LEAF_GROUND_TILT / 2, // 地面での傾き
      rotationZ: Math.random() * LEAF_GROUND_TILT - LEAF_GROUND_TILT / 2, // 地面での傾き
      scale: LEAF_BASE_SCALE + Math.random() * LEAF_SCALE_VARIATION,
      floatSpeed: LEAF_FLOAT_SPEED_BASE + Math.random() * LEAF_FLOAT_SPEED_VARIATION, // 浮き沈みの速度
      driftSpeed: LEAF_DRIFT_SPEED_BASE + Math.random() * LEAF_DRIFT_SPEED_VARIATION, // 横移動の速度
      rotationSpeed: LEAF_ROTATION_SPEED_BASE + Math.random() * LEAF_ROTATION_SPEED_VARIATION, // 回転速度
      phaseOffset: Math.random() * Math.PI * 2, // 位相オフセット
    }))
  , []);

  // 3Dモデルのcloneを事前に作成してパフォーマンス向上
  const leafClones = useMemo(() =>
    Array.from({ length: LEAF_COUNT }, () => leafScene.clone())
  , [leafScene]);

  useFrame((state) => {
    if (isWinter) return; // 冬は静止

    const time = state.clock.getElapsedTime();
    leavesRefs.current.forEach((ref, i) => {
      if (ref) {
        const data = leafData[i];
        // 水面の揺れに合わせた浮き沈み
        ref.position.y = WATER_SURFACE_Y + Math.sin(time * data.floatSpeed + data.phaseOffset) * 0.03;

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

  if (season !== "autumn" && season !== "winter") {
    return null; // 秋と冬の間だけ葉をレンダリング
  }

  return (
    <group>
      {leafData.map((data, i) => {
        // 冬は地面に、秋は水面に
        const yPosition = isWinter ? GROUND_Y : WATER_SURFACE_Y;
        const rotation: [number, number, number] = isWinter
          ? [data.rotationX, data.rotationY, data.rotationZ]
          : [0, data.rotationY, 0];
        // 冬は平らに（Y軸を圧縮）、秋は通常
        const scale: [number, number, number] = isWinter
          ? [data.scale, data.scale * WINTER_FLATTEN_SCALE, data.scale]
          : [data.scale, data.scale, data.scale];

        return (
          <group
            key={i}
            ref={(el) => {
              if (el) leavesRefs.current[i] = el;
            }}
            position={[data.x, yPosition, data.z]}
            rotation={rotation}
            scale={scale}
          >
            <primitive object={leafClones[i]} />
          </group>
        );
      })}
    </group>
  );
});

export default FallenLeaves;
