import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import { createRng, randomBetween } from "../utils/random";
import {
  BUBBLE_COUNT,
  BUBBLE_SIZE_MIN,
  BUBBLE_SIZE_MAX,
  BUBBLE_SPEED_MIN,
  BUBBLE_SPEED_MAX,
  BUBBLE_RESET_Y_THRESHOLD,
  BUBBLE_START_Y,
  BUBBLE_LOCATIONS,
  BUBBLE_SPHERE_WIDTH_SEGMENTS,
  BUBBLE_SPHERE_HEIGHT_SEGMENTS,
  BUBBLE_COLOR,
  BUBBLE_OPACITY,
} from "../constants/bubbleEffect";

interface BubbleData {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
}

const BubbleEffect: React.FC = () => {
  const bubbleRefs = useRef<THREE.Mesh[]>([]);
  const bubbleDataRef = useRef<BubbleData[]>([]);
  const rngRef = useRef(createRng(0xb0bb1e5));

  const createBubble = (): BubbleData => {
    const rng = rngRef.current;
    const size = randomBetween(rng, BUBBLE_SIZE_MIN, BUBBLE_SIZE_MAX);
    const speed = randomBetween(rng, BUBBLE_SPEED_MIN, BUBBLE_SPEED_MAX);
    const locationIndex = Math.floor(rng() * BUBBLE_LOCATIONS.length);
    const location = BUBBLE_LOCATIONS[locationIndex] ?? BUBBLE_LOCATIONS[0];

    return {
      x: location.x,
      y: BUBBLE_START_Y,
      z: location.z,
      size,
      speed,
    };
  };

  useMemo(() => {
    bubbleDataRef.current = Array.from({ length: BUBBLE_COUNT }, createBubble);
  }, []);

  useThrottledFrame((_, delta) => {
    bubbleRefs.current.forEach((mesh, index) => {
      const bubble = bubbleDataRef.current[index];
      if (!mesh || !bubble) return;

      bubble.y += bubble.speed * delta * 60;

      if (bubble.y > BUBBLE_RESET_Y_THRESHOLD) {
        const newBubble = createBubble();
        bubbleDataRef.current[index] = newBubble;
        mesh.position.set(newBubble.x, newBubble.y, newBubble.z);
      } else {
        mesh.position.y = bubble.y;
      }
    });
  }, 30);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(1, BUBBLE_SPHERE_WIDTH_SEGMENTS, BUBBLE_SPHERE_HEIGHT_SEGMENTS),
    []
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: BUBBLE_COLOR,
        transparent: true,
        opacity: BUBBLE_OPACITY,
      }),
    []
  );

  return (
    <group>
      {bubbleDataRef.current.map((bubble, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) {
              bubbleRefs.current[index] = el;
            }
          }}
          position={[bubble.x, bubble.y, bubble.z]}
          scale={[bubble.size, bubble.size, bubble.size]}
          geometry={geometry}
          material={material}
        />
      ))}
    </group>
  );
};

export default React.memo(BubbleEffect);
