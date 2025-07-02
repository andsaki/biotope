import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const BubbleEffect: React.FC = () => {
  const [bubbleData, setBubbleData] = useState<
    {
      id: number;
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
    }[]
  >([]);
  const bubbleGroup = useRef<THREE.Group>(null!);

  // Function to create a new bubble from one of three specific locations
  const createBubble = () => {
    const size = Math.random() * 0.03 + 0.01; // Further reduced size range for even smaller bubbles (0.01 to 0.04)
    const speed = Math.random() * 0.08 + 0.03; // Increased speed range for faster rising bubbles
    // Define three specific locations for bubble emission, potentially outside the bounding box
    const locations = [
      { x: -3.0, z: -3.0 }, // Location 1 - further out
      { x: 3.0, z: 0.0 }, // Location 2 - further out
      { x: -2.0, z: 3.0 }, // Location 3 - further out
    ];
    // Randomly select one of the three locations
    const location = locations[Math.floor(Math.random() * locations.length)];

    return {
      id: Math.random(), // Unique ID for key
      x: location.x,
      y: -1, // Start from the ground level
      z: location.z,
      size,
      speed,
    };
  };

  // Initialize bubbles
  useEffect(() => {
    const initialBubbles = Array.from({ length: 30 }, createBubble); // Reduced number of bubbles slightly for clarity at specific points
    setBubbleData(initialBubbles);
  }, []);

  // Update bubble positions each frame
  useFrame(() => {
    if (bubbleGroup.current) {
      setBubbleData((prevData) =>
        prevData.map((bubble) => {
          const newY = bubble.y + bubble.speed;
          // Reset bubble to bottom if it rises too high
          if (newY > 8) {
            return createBubble();
          }
          return { ...bubble, y: newY };
        })
      );
    }
  });

  // Render bubbles based on data
  const bubbles = bubbleData.map((bubble) => (
    <mesh
      key={bubble.id}
      position={[bubble.x, bubble.y, bubble.z]}
      scale={[bubble.size, bubble.size, bubble.size]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ADD8E6" // Light blue for bubble color
        transparent={true}
        opacity={0.8} // Increased opacity for better visibility
      />
    </mesh>
  ));

  return <group ref={bubbleGroup}>{bubbles}</group>;
};

export default BubbleEffect;
