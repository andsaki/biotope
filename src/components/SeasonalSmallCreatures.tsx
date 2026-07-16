import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSeason } from "../contexts";
import type { Season } from "../contexts/SeasonContext/context";

type CreatureKind = "butterfly" | "water-strider" | "dragonfly" | "snow-midge";

interface CreatureSeed {
  id: string;
  kind: CreatureKind;
  position: [number, number, number];
  color: string;
  accentColor: string;
  phase: number;
  speed: number;
  drift: number;
  scale: number;
}

const SEASONAL_CREATURES: Record<Season, readonly CreatureSeed[]> = {
  spring: [
    {
      id: "spring-butterfly-1",
      kind: "butterfly",
      position: [-4.8, 9.3, -3.6],
      color: "#fff0a8",
      accentColor: "#ffb7d2",
      phase: 0.2,
      speed: 0.9,
      drift: 0.42,
      scale: 0.58,
    },
    {
      id: "spring-butterfly-2",
      kind: "butterfly",
      position: [2.6, 9.7, -4.2],
      color: "#f7d6ff",
      accentColor: "#bff4ff",
      phase: 1.7,
      speed: 0.72,
      drift: 0.34,
      scale: 0.48,
    },
    {
      id: "spring-butterfly-3",
      kind: "butterfly",
      position: [-1.4, 9.1, 2.8],
      color: "#fff6cc",
      accentColor: "#ffd0a6",
      phase: 3.1,
      speed: 0.82,
      drift: 0.38,
      scale: 0.52,
    },
  ],
  summer: [
    {
      id: "summer-strider-1",
      kind: "water-strider",
      position: [-3.2, 8.18, 1.6],
      color: "#182328",
      accentColor: "#b8f6ff",
      phase: 0.3,
      speed: 0.56,
      drift: 0.3,
      scale: 0.62,
    },
    {
      id: "summer-strider-2",
      kind: "water-strider",
      position: [4.6, 8.2, -1.5],
      color: "#13202a",
      accentColor: "#d7fff3",
      phase: 2.4,
      speed: 0.48,
      drift: 0.34,
      scale: 0.54,
    },
    {
      id: "summer-strider-3",
      kind: "water-strider",
      position: [0.8, 8.16, 4.4],
      color: "#17262c",
      accentColor: "#c9fbff",
      phase: 4.1,
      speed: 0.52,
      drift: 0.28,
      scale: 0.48,
    },
  ],
  autumn: [
    {
      id: "autumn-dragonfly-1",
      kind: "dragonfly",
      position: [-5.2, 9.6, 0.8],
      color: "#b43f2d",
      accentColor: "#ffd2a1",
      phase: 0.8,
      speed: 1.05,
      drift: 0.52,
      scale: 0.58,
    },
    {
      id: "autumn-dragonfly-2",
      kind: "dragonfly",
      position: [3.8, 10.1, 1.8],
      color: "#c86a28",
      accentColor: "#ffe4b8",
      phase: 2.2,
      speed: 0.94,
      drift: 0.46,
      scale: 0.5,
    },
    {
      id: "autumn-dragonfly-3",
      kind: "dragonfly",
      position: [-0.4, 9.8, -4.8],
      color: "#9b302a",
      accentColor: "#ffc994",
      phase: 3.6,
      speed: 0.88,
      drift: 0.42,
      scale: 0.46,
    },
  ],
  winter: [
    {
      id: "winter-midge-1",
      kind: "snow-midge",
      position: [-4.2, 9.2, -2.8],
      color: "#e9fbff",
      accentColor: "#ffffff",
      phase: 0.4,
      speed: 0.38,
      drift: 0.28,
      scale: 0.42,
    },
    {
      id: "winter-midge-2",
      kind: "snow-midge",
      position: [2.2, 9.6, -1.8],
      color: "#d7f2ff",
      accentColor: "#ffffff",
      phase: 2.6,
      speed: 0.34,
      drift: 0.24,
      scale: 0.36,
    },
    {
      id: "winter-midge-3",
      kind: "snow-midge",
      position: [0.4, 9.0, 3.2],
      color: "#f5fdff",
      accentColor: "#dcefff",
      phase: 4.4,
      speed: 0.32,
      drift: 0.26,
      scale: 0.34,
    },
  ],
} satisfies Record<Season, readonly CreatureSeed[]>;

const CreatureShape = ({ seed }: { seed: CreatureSeed }) => {
  switch (seed.kind) {
    case "butterfly":
      return (
        <>
          <mesh rotation={[0, 0, -0.42]} position={[-0.055, 0.018, 0]} scale={[0.11, 0.16, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.72} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, 0.42]} position={[0.055, 0.018, 0]} scale={[0.11, 0.16, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.66} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.018, 0.12, 0.018]}>
            <capsuleGeometry args={[1, 1.8, 4, 8]} />
            <meshBasicMaterial color="#4f3a2e" />
          </mesh>
        </>
      );
    case "water-strider":
      return (
        <>
          <mesh scale={[0.1, 0.025, 0.035]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={seed.color} />
          </mesh>
          {[-0.12, 0, 0.12].map((offset) => (
            <React.Fragment key={offset}>
              <mesh position={[offset, -0.01, -0.12]} rotation={[0, 0.1, -0.88]} scale={[0.006, 0.18, 0.006]}>
                <cylinderGeometry args={[1, 1, 1, 6]} />
                <meshBasicMaterial color={seed.color} />
              </mesh>
              <mesh position={[offset, -0.01, 0.12]} rotation={[0, -0.1, 0.88]} scale={[0.006, 0.18, 0.006]}>
                <cylinderGeometry args={[1, 1, 1, 6]} />
                <meshBasicMaterial color={seed.color} />
              </mesh>
            </React.Fragment>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.34, 0.14, 1]}>
            <ringGeometry args={[0.92, 1, 32]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
    case "dragonfly":
      return (
        <>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[0.018, 0.22, 0.018]}>
            <capsuleGeometry args={[1, 2.6, 4, 8]} />
            <meshBasicMaterial color={seed.color} />
          </mesh>
          <mesh position={[0.19, 0.02, 0]} rotation={[0, 0, 0.18]} scale={[0.18, 0.045, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.38} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.19, 0.02, 0]} rotation={[0, 0, -0.18]} scale={[0.18, 0.045, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.38} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
    case "snow-midge":
      return (
        <>
          <mesh scale={[0.035, 0.035, 0.035]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.82} />
          </mesh>
          <mesh position={[0, 0.012, 0]} scale={[0.11, 0.04, 1]}>
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.26} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
  }
};

export const SeasonalSmallCreatures: React.FC = React.memo(() => {
  const { season } = useSeason();
  const creatures = useMemo(() => SEASONAL_CREATURES[season], [season]);
  const groupRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    creatures.forEach((seed, index) => {
      const group = groupRefs.current[index];
      if (!group) {
        return;
      }

      const wave = time * seed.speed + seed.phase;
      group.position.set(
        seed.position[0] + Math.sin(wave * 0.72) * seed.drift,
        seed.position[1] + Math.sin(wave * 1.5) * seed.drift * 0.22,
        seed.position[2] + Math.cos(wave * 0.58) * seed.drift
      );
      group.rotation.y = Math.sin(wave * 0.9) * 0.7;
      group.rotation.z = Math.sin(wave * 2.4) * 0.08;

      if (seed.kind === "water-strider") {
        group.rotation.y = Math.sin(wave * 0.46) * 0.24;
        group.position.y = seed.position[1] + Math.sin(wave * 1.2) * 0.02;
      }
    });
  });

  return (
    <group renderOrder={16}>
      {creatures.map((seed, index) => (
        <group
          key={seed.id}
          ref={(node) => {
            if (node) {
              groupRefs.current[index] = node;
            }
          }}
          position={seed.position}
          scale={seed.scale}
        >
          <CreatureShape seed={seed} />
        </group>
      ))}
    </group>
  );
});

SeasonalSmallCreatures.displayName = "SeasonalSmallCreatures";
