import React, { useMemo, useRef } from "react";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  SHOOTING_STAR_ACTIVE_SECONDS,
  SHOOTING_STAR_COLOR,
  SHOOTING_STAR_COUNT,
  SHOOTING_STAR_CYCLE_SECONDS,
  SHOOTING_STAR_DELAY_STEP_SECONDS,
  SHOOTING_STAR_DROP_Y,
  SHOOTING_STAR_HEAD_SIZE,
  SHOOTING_STAR_MAX_OPACITY,
  SHOOTING_STAR_ROTATION_Z,
  SHOOTING_STAR_SPACING_Z,
  SHOOTING_STAR_START_X,
  SHOOTING_STAR_START_Y,
  SHOOTING_STAR_START_Z,
  SHOOTING_STAR_TAIL_LENGTH,
  SHOOTING_STAR_TAIL_WIDTH,
  SHOOTING_STAR_TRAVEL_X,
} from "@/constants/shootingStars";

interface ShootingStarRefs {
  group: THREE.Group | null;
  tail: THREE.MeshBasicMaterial | null;
  head: THREE.MeshBasicMaterial | null;
}

/**
 * 夜空を短く横切る流れ星。
 */
const ShootingStars: React.FC = () => {
  const starRefs = useRef<ShootingStarRefs[]>(
    Array.from({ length: SHOOTING_STAR_COUNT }, () => ({
      group: null,
      tail: null,
      head: null,
    }))
  );

  const stars = useMemo(
    () =>
      Array.from({ length: SHOOTING_STAR_COUNT }, (_, index) => ({
        id: index,
        delay: index * SHOOTING_STAR_DELAY_STEP_SECONDS,
        yOffset: (index % 2) * 2.4,
        zOffset: (index - (SHOOTING_STAR_COUNT - 1) / 2) * SHOOTING_STAR_SPACING_Z,
      })),
    []
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    for (const star of stars) {
      const refs = starRefs.current[star.id];
      if (!refs.group || !refs.tail || !refs.head) {
        continue;
      }

      const cycleTime =
        (elapsed + star.delay) % SHOOTING_STAR_CYCLE_SECONDS;
      const isActive = cycleTime < SHOOTING_STAR_ACTIVE_SECONDS;
      const progress = isActive ? cycleTime / SHOOTING_STAR_ACTIVE_SECONDS : 0;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const opacity = isActive
        ? Math.sin(progress * Math.PI) * SHOOTING_STAR_MAX_OPACITY
        : 0;

      refs.group.position.set(
        SHOOTING_STAR_START_X - easedProgress * SHOOTING_STAR_TRAVEL_X,
        SHOOTING_STAR_START_Y + star.yOffset - easedProgress * SHOOTING_STAR_DROP_Y,
        SHOOTING_STAR_START_Z + star.zOffset
      );
      refs.tail.opacity = opacity;
      refs.head.opacity = opacity;
    }
  });

  return (
    <group>
      {stars.map((star) => (
        <Billboard
          key={star.id}
          ref={(group) => {
            starRefs.current[star.id].group = group;
          }}
          follow
        >
          <group rotation-z={SHOOTING_STAR_ROTATION_Z}>
            <mesh position={[-SHOOTING_STAR_TAIL_LENGTH / 2, 0, 0]}>
              <planeGeometry
                args={[SHOOTING_STAR_TAIL_LENGTH, SHOOTING_STAR_TAIL_WIDTH]}
              />
              <meshBasicMaterial
                ref={(material) => {
                  starRefs.current[star.id].tail = material;
                }}
                color={SHOOTING_STAR_COLOR}
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <sphereGeometry args={[SHOOTING_STAR_HEAD_SIZE, 12, 12]} />
              <meshBasicMaterial
                ref={(material) => {
                  starRefs.current[star.id].head = material;
                }}
                color={SHOOTING_STAR_COLOR}
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        </Billboard>
      ))}
    </group>
  );
};

export default ShootingStars;
