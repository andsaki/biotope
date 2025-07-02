import React, { useEffect, useState } from "react";
import { useSeason } from "../contexts/SeasonContext";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

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
        fishSpeed = 0.015; // Further reduced speed for gentler movement
        fishColor = "#FF6347"; // Tomato
        break;
      case "summer":
        fishSpeed = 0.02; // Further reduced speed for gentler movement
        fishColor = "#FF4500"; // OrangeRed
        break;
      case "autumn":
        fishSpeed = 0.01; // Further reduced speed for gentler movement
        fishColor = "#DAA520"; // GoldenRod
        break;
      case "winter":
        fishSpeed = 0.005; // Further reduced speed for gentler movement
        fishColor = "#4682B4"; // SteelBlue
        break;
      default:
        fishSpeed = 0.015; // Further reduced speed for gentler movement
        fishColor = "#FF6347";
    }

    for (let i = 0; i < fishCount; i++) {
      newFishList.push({
        id: i,
        x: Math.random() * 10 - 5,
        y: Math.random() * 8 + 0.0, // Adjusted to start from Y=0 upwards with top face lowered further
        z: Math.random() * 4.5 - 1.5, // Adjusted to utilize the box space starting slightly above ground level
        speed: fishSpeed + (Math.random() * 0.02 - 0.01),
        directionX: Math.random() * Math.PI * 2,
        directionY: Math.random() * Math.PI * 2,
        color: fishColor,
        size: 0.2 + Math.random() * 0.3,
      });
    }
    setFishList(newFishList);
  }, [season]);

  useFrame((_, delta) => {
    setFishList((prevFishList) =>
      prevFishList.map((fish) => {
        let newX = fish.x + Math.cos(fish.directionX) * fish.speed * delta * 60;
        let newY = fish.y + Math.sin(fish.directionY) * fish.speed * delta * 60;
        let newZ =
          fish.z + Math.sin(fish.directionX) * fish.speed * 0.2 * delta * 60; // Reduced Z movement influence
        // Clamp Z position to ensure it stays within the box starting slightly above ground level
        newZ = Math.max(-1.5, Math.min(3.0, newZ));

        // Add slight vertical oscillation to mimic swimming
        newY += Math.sin(Date.now() * 0.002 + fish.id) * 0.01;

        // Boundary check - strictly enforce vertically enlarged and horizontally reduced box boundaries
        if (newX < -6.0 || newX > 6.0) {
          fish.directionX = Math.PI - fish.directionX;
          newX = Math.max(-6.0, Math.min(6.0, newX)); // Clamp to horizontally reduced box boundary
        }
        if (newY < 0.0 || newY > 8.0) {
          fish.directionY = -fish.directionY;
          newY = Math.max(0.0, Math.min(8.0, newY)); // Clamp to box boundary with bottom face above Y=0 and top face lowered further
        }
        if (newZ < -1.5 || newZ > 3.0) {
          // Adjusted to keep fish within box vertical range starting slightly above ground level
          fish.directionX = Math.PI - fish.directionX;
          newZ = Math.max(-1.5, Math.min(3.0, newZ)); // Clamp to box boundary starting slightly above ground level
        }

        // Random direction change - reduced frequency for smoother movement
        if (Math.random() < 0.005) {
          fish.directionX += (Math.random() * Math.PI) / 4 - Math.PI / 8;
          fish.directionY += (Math.random() * Math.PI) / 4 - Math.PI / 8;
        }

        return { ...fish, x: newX, y: newY, z: newZ };
      })
    );
  });

  const { scene } = useGLTF(
    "/assets/Smoked Fish Raw/weflciqaa_tier_0.gltf",
    true
  );

  // Log successful model loading and scene details for debugging
  useEffect(() => {
    console.log("GLTF model loaded successfully:", scene);
    console.log("Scene children:", scene.children);
  }, [scene]);

  // Create refs for each fish to update positions dynamically
  const fishRefs = React.useRef<THREE.Group[]>([]);

  useEffect(() => {
    fishRefs.current = fishList.map(() => new THREE.Group());
  }, [fishList.length]);

  useFrame(() => {
    fishRefs.current.forEach((ref, index) => {
      const fish = fishList[index];
      if (ref && fish) {
        ref.position.set(fish.x, fish.y, fish.z);
        // Align rotation with movement direction for more natural look
        ref.rotation.set(0, fish.directionX + Math.PI / 2, 0);
      }
    });
  });

  // Log positions for debugging
  useEffect(() => {
    const interval = setInterval(() => {
      if (fishList.length > 0) {
        console.log(
          "Fish positions:",
          fishList.map((f) => ({ x: f.x, y: f.y, z: f.z }))
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [fishList]);

  return (
    <group>
      {fishList.map((fish, index) => (
        <group
          key={fish.id}
          ref={(el) => (fishRefs.current[index] = el as THREE.Group)}
        >
          <primitive
            object={scene.clone()}
            scale={[fish.size * 10, fish.size * 10, fish.size * 10]} // Much larger scale for maximum visibility
            rotation={[Math.PI / 2, 0, 0]} // Adjust rotation on X-axis to correct orientation
            // Material override removed to preserve original model textures
          />
          {/* Temporarily hide fallback to focus on GLTF model */}
          {/* <mesh>
            <boxGeometry
              args={[fish.size * 0.5, fish.size * 0.3, fish.size * 0.15]}
            />
            <meshPhongMaterial
              color={fish.color}
              shininess={100}
              specular="#666"
            />
          </mesh> */}
        </group>
      ))}
    </group>
  );
};

export default FishManager;
