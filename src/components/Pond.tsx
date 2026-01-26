import React, { useRef, useMemo } from "react";
import { Mesh, CircleGeometry } from "three";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 池コンポーネント
 * 季節に応じて色と霧のレベルが変化する池の表現
 */
const Pond: React.FC = () => {
  const { season } = useSeason();
  const meshRef = useRef<Mesh>(null!);

  // ジオメトリを共有してメモリ使用量を削減
  const circleGeometry = useMemo(() => new CircleGeometry(5, 32), []);

  // 季節に基づいて池の色と霧を定義する
  const { pondColor, fogLevel } = useMemo(() => {
    switch (season) {
      case "spring":
        return { pondColor: "#6CA080", fogLevel: 0.2 };
      case "summer":
        return { pondColor: "#4C8C6A", fogLevel: 0.1 };
      case "autumn":
        return { pondColor: "#5C7A6A", fogLevel: 0.3 };
      case "winter":
        return { pondColor: "#4A6A7A", fogLevel: 0.5 };
      default:
        return { pondColor: "#6CA080", fogLevel: 0.2 };
    }
  }, [season]);

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]} geometry={circleGeometry}>
        <meshStandardMaterial
          color={pondColor}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 0, -0.9]} rotation={[-Math.PI / 2, 0, 0]} geometry={circleGeometry}>
        <meshStandardMaterial
          color="#FFFFFF"
          transparent={true}
          opacity={fogLevel}
        />
      </mesh>
    </group>
  );
};

export default Pond;
