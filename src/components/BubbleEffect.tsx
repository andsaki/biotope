import React, { useRef, useMemo, useCallback, useEffect } from "react";
import * as THREE from "three";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import { usePerformanceProfile } from "../hooks/usePerformanceProfile";
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
  const performanceProfile = usePerformanceProfile();
  const bubbleCount = Math.max(
    10,
    Math.round(BUBBLE_COUNT * performanceProfile.bubbleCountMultiplier)
  );

  const createBubble = useCallback((): BubbleData => {
    const size = Math.random() * (BUBBLE_SIZE_MAX - BUBBLE_SIZE_MIN) + BUBBLE_SIZE_MIN;
    const speed = Math.random() * (BUBBLE_SPEED_MAX - BUBBLE_SPEED_MIN) + BUBBLE_SPEED_MIN;
    const location = BUBBLE_LOCATIONS[Math.floor(Math.random() * BUBBLE_LOCATIONS.length)];

    return {
      x: location.x,
      y: BUBBLE_START_Y,
      z: location.z,
      size,
      speed,
    };
  }, []);

  useEffect(() => {
    bubbleDataRef.current = Array.from({ length: bubbleCount }, createBubble);
    bubbleRefs.current = bubbleRefs.current.slice(0, bubbleCount);
  }, [bubbleCount, createBubble]);

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
          ref={(el) => (bubbleRefs.current[index] = el!)}
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
