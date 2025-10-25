import React, { useMemo } from "react";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 大型水草コンポーネント
 * 季節に応じて色が変化する水中の水草
 */
const WaterPlantsLarge: React.FC = () => {
  const { season } = useSeason();

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
    </group>
  );
};

export default WaterPlantsLarge;
