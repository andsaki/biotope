import React, { useMemo } from "react";
import * as THREE from "three";
import { ROCKS_DATA, ROCK_GEOMETRY } from "../constants/rocks";

/**
 * 岩石コンポーネント
 * ビオトープ内に配置される複数の岩を表示
 * geometryを共有して最適化
 */
const Rocks: React.FC = () => {
  // 全ての岩で同じgeometryを共有
  const sharedGeometry = useMemo(
    () => new THREE.DodecahedronGeometry(ROCK_GEOMETRY.radius, ROCK_GEOMETRY.detail),
    []
  );

  return (
    <group>
      {ROCKS_DATA.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
          geometry={sharedGeometry}
        >
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
