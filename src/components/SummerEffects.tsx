import React from "react";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 夏の追加エフェクト
 * 夏の強い日差しを表現する追加照明
 */
const SummerEffects: React.FC = () => {
  const { season } = useSeason();

  if (season !== "summer") {
    return null;
  }

  return (
    <group>
      {/* 夏の追加照明（控えめ） */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.2}
        color="#FFEB3B"
        distance={30}
      />
    </group>
  );
};

export default SummerEffects;
