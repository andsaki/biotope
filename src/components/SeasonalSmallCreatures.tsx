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

interface SeasonalSmallCreaturesProps {
  bottlePosition: [number, number, number];
  bottleSignal: number;
  lastWaterPoint: [number, number, number] | null;
  waterSignal: number;
}

const BOTTLE_REACTION_SECONDS = 5.5;
const WATER_REACTION_SECONDS = 2.2;
const CREATURE_SCALE_MULTIPLIER = 0.72;

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
    {
      id: "spring-butterfly-4",
      kind: "butterfly",
      position: [4.2, 9.0, 2.4],
      color: "#fff7b8",
      accentColor: "#d7f8ff",
      phase: 4.5,
      speed: 0.78,
      drift: 0.36,
      scale: 0.5,
    },
    {
      id: "spring-butterfly-5",
      kind: "butterfly",
      position: [-6.1, 9.5, 0.6],
      color: "#ffe6f1",
      accentColor: "#f7ffbf",
      phase: 5.6,
      speed: 0.86,
      drift: 0.44,
      scale: 0.46,
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
    {
      id: "summer-strider-4",
      kind: "water-strider",
      position: [-5.5, 8.19, -2.6],
      color: "#16242b",
      accentColor: "#bff8ff",
      phase: 5.2,
      speed: 0.5,
      drift: 0.32,
      scale: 0.52,
    },
    {
      id: "summer-strider-5",
      kind: "water-strider",
      position: [2.4, 8.18, 2.6],
      color: "#142229",
      accentColor: "#d5fff6",
      phase: 6.1,
      speed: 0.54,
      drift: 0.28,
      scale: 0.5,
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
    {
      id: "autumn-dragonfly-4",
      kind: "dragonfly",
      position: [5.6, 9.3, -2.2],
      color: "#d07a33",
      accentColor: "#ffe0b0",
      phase: 4.8,
      speed: 0.98,
      drift: 0.44,
      scale: 0.5,
    },
    {
      id: "autumn-dragonfly-5",
      kind: "dragonfly",
      position: [-2.8, 10.2, 3.4],
      color: "#a83a25",
      accentColor: "#ffd7a8",
      phase: 5.9,
      speed: 0.92,
      drift: 0.48,
      scale: 0.48,
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
    {
      id: "winter-midge-4",
      kind: "snow-midge",
      position: [-1.8, 9.8, -4.2],
      color: "#edfaff",
      accentColor: "#f7fdff",
      phase: 5.4,
      speed: 0.36,
      drift: 0.25,
      scale: 0.36,
    },
    {
      id: "winter-midge-5",
      kind: "snow-midge",
      position: [4.8, 9.3, 1.6],
      color: "#e1f7ff",
      accentColor: "#ffffff",
      phase: 6.2,
      speed: 0.33,
      drift: 0.27,
      scale: 0.34,
    },
  ],
} satisfies Record<Season, readonly CreatureSeed[]>;

const CreatureShape = ({ seed }: { seed: CreatureSeed }) => {
  switch (seed.kind) {
    case "butterfly":
      return (
        <>
          <mesh rotation={[0, 0, -0.42]} position={[-0.032, 0.01, 0]} scale={[0.07, 0.1, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.56} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, 0.42]} position={[0.032, 0.01, 0]} scale={[0.07, 0.1, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[0.009, 0.07, 0.009]}>
            <capsuleGeometry args={[1, 1.8, 4, 8]} />
            <meshBasicMaterial color="#5e4a38" transparent opacity={0.78} />
          </mesh>
        </>
      );
    case "water-strider":
      return (
        <>
          <mesh scale={[0.08, 0.018, 0.026]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.72} />
          </mesh>
          {[-0.12, 0, 0.12].map((offset) => (
            <React.Fragment key={offset}>
              <mesh position={[offset * 0.55, -0.006, -0.064]} rotation={[0, 0.1, -0.88]} scale={[0.003, 0.1, 0.003]}>
                <cylinderGeometry args={[1, 1, 1, 6]} />
                <meshBasicMaterial color={seed.color} transparent opacity={0.62} />
              </mesh>
              <mesh position={[offset * 0.55, -0.006, 0.064]} rotation={[0, -0.1, 0.88]} scale={[0.003, 0.1, 0.003]}>
                <cylinderGeometry args={[1, 1, 1, 6]} />
                <meshBasicMaterial color={seed.color} transparent opacity={0.62} />
              </mesh>
            </React.Fragment>
          ))}
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.26, 0.11, 1]}>
            <ringGeometry args={[0.92, 1, 32]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
    case "dragonfly":
      return (
        <>
          <mesh position={[0, 0, 0]} scale={[0.18, 0.012, 0.012]}>
            <sphereGeometry args={[1, 14, 8]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.74} />
          </mesh>
          <mesh position={[0.2, 0, 0]} scale={[0.026, 0.026, 0.022]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#3a2119" transparent opacity={0.76} />
          </mesh>
          <mesh position={[0.055, 0.016, 0.062]} rotation={[0.28, 0, 0.18]} scale={[0.09, 0.024, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.28} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.055, 0.016, -0.062]} rotation={[-0.28, 0, 0.18]} scale={[0.09, 0.024, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.28} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.04, 0.014, 0.052]} rotation={[0.22, 0, -0.16]} scale={[0.075, 0.02, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.22} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.04, 0.014, -0.052]} rotation={[-0.22, 0, -0.16]} scale={[0.075, 0.02, 1]}>
            <circleGeometry args={[1, 18]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.22} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
    case "snow-midge":
      return (
        <>
          <mesh scale={[0.026, 0.026, 0.026]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={seed.color} transparent opacity={0.62} />
          </mesh>
          <mesh position={[0, 0.008, 0]} scale={[0.07, 0.026, 1]}>
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial color={seed.accentColor} transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        </>
      );
  }
};

const getReactionTarget = (
  seed: CreatureSeed,
  bottlePosition: [number, number, number],
  index: number,
  time: number
): [number, number, number] => {
  const angle = seed.phase + index * 0.9 + time * 0.35;
  const radius = seed.kind === "water-strider" ? 0.78 : 1.05 + (index % 2) * 0.28;
  const y =
    seed.kind === "water-strider"
      ? bottlePosition[1] - 0.02
      : bottlePosition[1] + 1.0 + Math.sin(time * 1.4 + seed.phase) * 0.18;

  return [
    bottlePosition[0] + Math.cos(angle) * radius,
    y,
    bottlePosition[2] + Math.sin(angle) * radius,
  ];
};

const getWaterScatterTarget = (
  seed: CreatureSeed,
  waterPoint: [number, number, number],
  index: number
): [number, number, number] => {
  const dx = seed.position[0] - waterPoint[0];
  const dz = seed.position[2] - waterPoint[2];
  const distance = Math.hypot(dx, dz) || 1;
  const push = seed.kind === "water-strider" ? 1.6 : 1.05 + (index % 3) * 0.24;
  const lift = seed.kind === "water-strider" ? 0.02 : 0.38;

  return [
    seed.position[0] + (dx / distance) * push,
    seed.position[1] + lift,
    seed.position[2] + (dz / distance) * push,
  ];
};

export const SeasonalSmallCreatures: React.FC<SeasonalSmallCreaturesProps> = React.memo(({
  bottlePosition,
  bottleSignal,
  lastWaterPoint,
  waterSignal,
}) => {
  const { season } = useSeason();
  const creatures = useMemo(() => SEASONAL_CREATURES[season], [season]);
  const groupRefs = useRef<THREE.Group[]>([]);
  const previousSignalRef = useRef(bottleSignal);
  const previousWaterSignalRef = useRef(waterSignal);
  const reactionStartedAtRef = useRef<number | null>(null);
  const waterReactionStartedAtRef = useRef<number | null>(null);
  const reactionTarget = useMemo(() => new THREE.Vector3(), []);
  const waterScatterTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (bottleSignal !== previousSignalRef.current) {
      previousSignalRef.current = bottleSignal;
      reactionStartedAtRef.current = time;
    }

    if (waterSignal !== previousWaterSignalRef.current) {
      previousWaterSignalRef.current = waterSignal;
      waterReactionStartedAtRef.current = time;
    }

    const reactionAge =
      reactionStartedAtRef.current === null ? BOTTLE_REACTION_SECONDS : time - reactionStartedAtRef.current;
    const reactionStrength = Math.max(0, 1 - reactionAge / BOTTLE_REACTION_SECONDS);
    const easedReaction = reactionStrength * reactionStrength * (3 - 2 * reactionStrength);
    const waterReactionAge =
      waterReactionStartedAtRef.current === null
        ? WATER_REACTION_SECONDS
        : time - waterReactionStartedAtRef.current;
    const waterReactionStrength = Math.max(0, 1 - waterReactionAge / WATER_REACTION_SECONDS);
    const easedWaterReaction =
      waterReactionStrength * waterReactionStrength * (3 - 2 * waterReactionStrength);

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

      if (easedReaction > 0) {
        const target = getReactionTarget(seed, bottlePosition, index, time);
        reactionTarget.set(target[0], target[1], target[2]);
        group.position.lerp(reactionTarget, easedReaction * 0.72);
      }

      if (lastWaterPoint && easedWaterReaction > 0) {
        const target = getWaterScatterTarget(seed, lastWaterPoint, index);
        waterScatterTarget.set(target[0], target[1], target[2]);
        group.position.lerp(waterScatterTarget, easedWaterReaction * 0.82);
      }

      group.rotation.y = Math.sin(wave * 0.9) * 0.7;
      group.rotation.z = Math.sin(wave * 2.4) * (0.08 + easedWaterReaction * 0.22);
      group.scale.setScalar(
        seed.scale * CREATURE_SCALE_MULTIPLIER * (1 + easedReaction * 0.12 + easedWaterReaction * 0.1)
      );

      if (seed.kind === "water-strider") {
        group.rotation.y = Math.sin(wave * 0.46) * 0.24;
        if (easedReaction <= 0 && easedWaterReaction <= 0) {
          group.position.y = seed.position[1] + Math.sin(wave * 1.2) * 0.02;
        }
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
          scale={seed.scale * CREATURE_SCALE_MULTIPLIER}
        >
          <CreatureShape seed={seed} />
        </group>
      ))}
    </group>
  );
});

SeasonalSmallCreatures.displayName = "SeasonalSmallCreatures";
