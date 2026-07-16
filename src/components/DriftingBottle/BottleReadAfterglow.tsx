import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BottleReadAfterglowProps {
  color: string;
  onComplete: () => void;
}

const AFTERGLOW_LIFETIME = 1.75;

const afterglowSeeds: readonly {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  lift: number;
}[] = [
  { angle: 0.1, radius: 0.2, speed: 0.82, size: 0.026, lift: 0.1 },
  { angle: 0.72, radius: 0.34, speed: 0.74, size: 0.018, lift: 0.16 },
  { angle: 1.35, radius: 0.28, speed: 0.68, size: 0.022, lift: 0.12 },
  { angle: 2.4, radius: 0.32, speed: 0.75, size: 0.02, lift: 0.18 },
  { angle: 3.55, radius: 0.38, speed: 0.61, size: 0.018, lift: 0.08 },
  { angle: 4.7, radius: 0.24, speed: 0.88, size: 0.021, lift: 0.14 },
  { angle: 5.62, radius: 0.36, speed: 0.7, size: 0.017, lift: 0.11 },
  { angle: 6.05, radius: 0.3, speed: 0.92, size: 0.015, lift: 0.2 },
];

export const BottleReadAfterglow = ({
  color,
  onComplete,
}: BottleReadAfterglowProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const sparkleMaterialRef = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#cffff5",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      sparkleMaterialRef.dispose();
    };
  }, [sparkleMaterialRef]);

  useEffect(() => {
    sparkleMaterialRef.color.set(color);
  }, [color, sparkleMaterialRef]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    if (startedAtRef.current === null) {
      startedAtRef.current = state.clock.getElapsedTime();
    }

    const age = state.clock.getElapsedTime() - startedAtRef.current;
    const progress = Math.min(1, age / AFTERGLOW_LIFETIME);
    const fade = Math.pow(1 - progress, 1.7);

    groupRef.current.scale.setScalar(1 + progress * 0.9);
    groupRef.current.rotation.y = age * 0.55;
    sparkleMaterialRef.opacity = fade * 0.72;

    if (progress >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.12, 0]} renderOrder={24}>
      {afterglowSeeds.map((seed, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(seed.angle) * seed.radius * (1 + seed.speed * 0.7),
            0.035 + index * 0.004 + seed.lift,
            Math.sin(seed.angle) * seed.radius * (1 + seed.speed * 0.7),
          ]}
          rotation={[0, seed.angle, seed.angle * 0.37]}
          scale={[seed.size, seed.size * (1.3 + seed.speed * 0.25), seed.size]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <primitive object={sparkleMaterialRef} attach="material" />
        </mesh>
      ))}
    </group>
  );
};
