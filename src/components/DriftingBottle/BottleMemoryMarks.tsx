import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BottleMemorySign } from "@/utils/bottleJournal";

interface BottleMemoryMarksProps {
  signs: BottleMemorySign[];
}

const createSignSeed = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const getSignPlacement = (date: string, index: number) => {
  const seed = createSignSeed(date);
  const angle = ((seed % 360) / 180) * Math.PI + index * 0.46;
  const radius = 0.72 + ((seed >>> 4) % 5) * 0.12;
  const size = 0.13 + ((seed >>> 8) % 4) * 0.016;
  return { angle, radius, size };
};

export const BottleMemoryMarks = ({ signs }: BottleMemoryMarksProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f9ffd2",
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      ringMaterial.dispose();
    };
  }, [ringMaterial]);

  useFrame((state) => {
    if (!groupRef.current || signs.length === 0) {
      return;
    }

    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.16) * 0.08;
    ringMaterial.opacity = 0.1 + Math.sin(time * 0.9) * 0.025;
  });

  if (signs.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0.86, 0]} renderOrder={23}>
      {signs.slice(0, 7).map((sign, index) => {
        const placement = getSignPlacement(sign.date, index);
        const x = Math.cos(placement.angle) * placement.radius;
        const z = Math.sin(placement.angle) * placement.radius;
        const scale = placement.size * (1 - index * 0.045);
        const signColor = sign.omen?.color ?? "#fff2a8";

        return (
          <group key={sign.date} position={[x, 0.01 + index * 0.004, z]}>
            <mesh rotation={[-Math.PI / 2, 0, placement.angle]} scale={[scale, scale * 1.55, 1]}>
              <circleGeometry args={[1, 16]} />
              <meshBasicMaterial
                color={signColor}
                transparent={true}
                opacity={0.34}
                depthWrite={false}
                depthTest={true}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale * 2.7, scale * 2.7, 1]}>
              <ringGeometry args={[0.82, 1, 40]} />
              <primitive object={ringMaterial} attach="material" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
