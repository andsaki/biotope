import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";

interface Fish {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  directionX: number;
  directionY: number;
  color: string;
  size: number;
}

const FishManager: React.FC = () => {
  const { season } = useSeason();
  const [fishList, setFishList] = useState<Fish[]>([]);

  useEffect(() => {
    // Initialize fish based on season
    const newFishList: Fish[] = [];
    let fishSpeed: number;
    let fishColor: string;
    const fishCount = 10;

    switch (season) {
      case "spring":
        fishSpeed = 0.025; // Reduced speed for slower animation
        fishColor = "#FF6347"; // Tomato
        break;
      case "summer":
        fishSpeed = 0.035; // Reduced speed for slower animation
        fishColor = "#FF4500"; // OrangeRed
        break;
      case "autumn":
        fishSpeed = 0.015; // Reduced speed for slower animation
        fishColor = "#DAA520"; // GoldenRod
        break;
      case "winter":
        fishSpeed = 0.01; // Reduced speed for slower animation
        fishColor = "#4682B4"; // SteelBlue
        break;
      default:
        fishSpeed = 0.025; // Reduced speed for slower animation
        fishColor = "#FF6347";
    }

    for (let i = 0; i < fishCount; i++) {
      newFishList.push({
        id: i,
        x: Math.random() * 8 - 4,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1.5,
        speed: fishSpeed + (Math.random() * 0.02 - 0.01),
        directionX: Math.random() * Math.PI * 2,
        directionY: Math.random() * Math.PI * 2,
        color: fishColor,
        size: 0.2 + Math.random() * 0.3,
      });
    }
    setFishList(newFishList);
  }, [season]);

  useFrame(() => {
    setFishList((prevFishList) =>
      prevFishList.map((fish) => {
        let newX = fish.x + Math.cos(fish.directionX) * fish.speed;
        let newY = fish.y + Math.sin(fish.directionY) * fish.speed;
        let newZ = fish.z + Math.sin(fish.directionX) * fish.speed * 0.5;

        // Boundary check
        if (newX < -4 || newX > 4) {
          fish.directionX = Math.PI - fish.directionX;
        }
        if (newY < -1 || newY > 1) {
          fish.directionY = -fish.directionY;
        }
        if (newZ < -1.8 || newZ > -0.5) {
          // Adjusted to prevent passing through ground at z = -2
          fish.directionX = Math.PI - fish.directionX;
        }

        // Random direction change
        if (Math.random() < 0.02) {
          fish.directionX += (Math.random() * Math.PI) / 2 - Math.PI / 4;
          fish.directionY += (Math.random() * Math.PI) / 2 - Math.PI / 4;
        }

        return { ...fish, x: newX, y: newY, z: newZ };
      })
    );
  });

  return (
    <group>
      {fishList.map((fish) => (
        <mesh
          key={fish.id}
          position={[fish.x, fish.y, fish.z]}
          rotation={[0, fish.directionX, 0]}
        >
          {/* Body of the fish (Yamame-like brownish color with spots) */}
          <sphereGeometry args={[fish.size, 16, 16]} />
          <meshPhongMaterial
            color="#8B4513" // SaddleBrown for Yamame body
            shininess={100}
            specular="#666"
          />
          {/* Placeholder for texture map - actual texture for Yamame would require image assets */}
          {/* <meshStandardMaterial map={yamameTextureMap} /> */}
          {/* Tail fin */}
          <mesh position={[0, 0, -fish.size * 1.5]}>
            <coneGeometry args={[fish.size * 0.8, fish.size * 1.5, 8]} />
            <meshPhongMaterial
              color="#8B4513" // SaddleBrown for tail
              shininess={100}
              specular="#666"
            />
          </mesh>
          {/* Dorsal fin */}
          <mesh
            position={[0, fish.size * 0.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[fish.size * 0.4, fish.size * 0.8, 3]} />
            <meshPhongMaterial
              color="#8B4513" // SaddleBrown for dorsal fin
              shininess={100}
              specular="#666"
            />
          </mesh>
          {/* Side fins */}
          <mesh
            position={[fish.size * 0.5, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <coneGeometry args={[fish.size * 0.3, fish.size * 0.6, 3]} />
            <meshPhongMaterial
              color="#8B4513" // SaddleBrown for side fin
              shininess={100}
              specular="#666"
            />
          </mesh>
          <mesh
            position={[-fish.size * 0.5, 0, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <coneGeometry args={[fish.size * 0.3, fish.size * 0.6, 3]} />
            <meshPhongMaterial
              color="#8B4513" // SaddleBrown for side fin
              shininess={100}
              specular="#666"
            />
          </mesh>
          {/* Spots on body to mimic Yamame pattern */}
          <mesh position={[0, 0, fish.size * 0.2]}>
            <sphereGeometry args={[fish.size * 0.1, 8, 8]} />
            <meshPhongMaterial
              color="#000000" // Black spots
              shininess={100}
              specular="#666"
            />
          </mesh>
          <mesh position={[fish.size * 0.3, 0, fish.size * 0.1]}>
            <sphereGeometry args={[fish.size * 0.08, 8, 8]} />
            <meshPhongMaterial
              color="#000000" // Black spots
              shininess={100}
              specular="#666"
            />
          </mesh>
          <mesh position={[-fish.size * 0.3, 0, fish.size * 0.3]}>
            <sphereGeometry args={[fish.size * 0.09, 8, 8]} />
            <meshPhongMaterial
              color="#000000" // Black spots
              shininess={100}
              specular="#666"
            />
          </mesh>
        </mesh>
      ))}
    </group>
  );
};

export default FishManager;
