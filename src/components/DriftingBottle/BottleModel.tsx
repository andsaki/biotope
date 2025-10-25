import { memo } from "react";

/** 瓶モデルのプロパティ */
interface BottleModelProps {
  /** ホバー状態 */
  hovered: boolean;
}

/** 瓶の色定義 */
const BOTTLE_COLORS = {
  glass: "#88ccaa",
  cork: "#d4a574",
  paper: "#f5e6d3",
  highlight: "#ffffff",
};

/** ガラス素材のプロパティ */
const GLASS_MATERIAL = {
  transparent: true,
  opacity: 0.6,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.9,
  thickness: 0.5,
};

/**
 * 漂流瓶の3Dモデル
 * @param props - コンポーネントのプロパティ
 */
export const BottleModel = memo(({ hovered }: BottleModelProps) => {
  return (
    <>
      {/* 瓶の本体 */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.8, 16]} />
        <meshPhysicalMaterial color={BOTTLE_COLORS.glass} {...GLASS_MATERIAL} />
      </mesh>

      {/* 瓶の首 */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.3, 16]} />
        <meshPhysicalMaterial color={BOTTLE_COLORS.glass} {...GLASS_MATERIAL} />
      </mesh>

      {/* コルク栓 */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.15, 16]} />
        <meshStandardMaterial color={BOTTLE_COLORS.cork} roughness={0.8} />
      </mesh>

      {/* 中の便箋（巻いた紙） */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
        <meshStandardMaterial color={BOTTLE_COLORS.paper} roughness={0.6} />
      </mesh>

      {/* ホバー時のハイライト */}
      {hovered && (
        <mesh>
          <cylinderGeometry args={[0.16, 0.13, 0.85, 16]} />
          <meshBasicMaterial
            color={BOTTLE_COLORS.highlight}
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </>
  );
});

BottleModel.displayName = "BottleModel";
