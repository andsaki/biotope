import React from "react";
import { ROCKS_DATA, ROCK_GEOMETRY } from "../constants/rocks";

/**
 * 岩石コンポーネント
 * ビオトープ内に配置される複数の岩を表示
 */
const Rocks: React.FC = () => {
  return (
    <group>
      {ROCKS_DATA.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
        >
          <dodecahedronGeometry args={[ROCK_GEOMETRY.radius, ROCK_GEOMETRY.detail]} />
          <meshStandardMaterial
            color={rock.color}
            roughness={rock.roughness}
            metalness={rock.metalness}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Rocks;
