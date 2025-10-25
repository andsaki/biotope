import React, { useRef } from "react";
import { useSeason } from "../contexts/SeasonContext";

/**
 * 池コンポーネント
 * 季節に応じて色と霧のレベルが変化する池の表現
 */
const Pond: React.FC = () => {
  const { season } = useSeason();
  const meshRef = useRef<any>(null!);

  // 季節に基づいて池の色と霧を定義する
  let pondColor: string;
  let fogLevel: number;

  switch (season) {
    case "spring":
      pondColor = "#6CA080";
      fogLevel = 0.2;
      break;
    case "summer":
      pondColor = "#4C8C6A";
      fogLevel = 0.1;
      break;
    case "autumn":
      pondColor = "#5C7A6A";
      fogLevel = 0.3;
      break;
    case "winter":
      pondColor = "#4A6A7A";
      fogLevel = 0.5;
      break;
    default:
      pondColor = "#6CA080";
      fogLevel = 0.2;
  }

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial
          color={pondColor}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 0, -0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 32]} />
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
