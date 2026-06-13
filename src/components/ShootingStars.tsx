import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  SHOOTING_STAR_ACTIVE_SECONDS,
  SHOOTING_STAR_COLOR,
  SHOOTING_STAR_COUNT,
  SHOOTING_STAR_CYCLE_SECONDS,
  SHOOTING_STAR_DELAY_STEP_SECONDS,
  SHOOTING_STAR_HEAD_SIZE,
  SHOOTING_STAR_MAX_OPACITY,
  SHOOTING_STAR_START_X,
  SHOOTING_STAR_START_Y,
  SHOOTING_STAR_START_Z,
  SHOOTING_STAR_TAIL_LENGTH,
  SHOOTING_STAR_TRAVEL_X,
  SHOOTING_STAR_TRAVEL_Z,
} from "@/constants/shootingStars";

interface ShootingStarRefs {
  group: THREE.Group | null;
  tail: THREE.LineBasicMaterial | null;
  head: THREE.PointsMaterial | null;
}

/**
 * 夜空を控えめに横切る細い光跡。
 */
const ShootingStars: React.FC = () => {
  const starRefs = useRef<ShootingStarRefs[]>(
    Array.from({ length: SHOOTING_STAR_COUNT }, () => ({
      group: null,
      tail: null,
      head: null,
    }))
  );

  const tailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-SHOOTING_STAR_TAIL_LENGTH, 0, 0, 0, 0, 0],
        3
      )
    );
    return geometry;
  }, []);

  const headGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return geometry;
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: SHOOTING_STAR_COUNT }, (_, index) => ({
        id: index,
        delay: index * SHOOTING_STAR_DELAY_STEP_SECONDS,
        yOffset: index * 0.35,
        zOffset: (index - 1) * 3.2,
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

      const cycleTime = (elapsed + star.delay) % SHOOTING_STAR_CYCLE_SECONDS;
      const isActive = cycleTime < SHOOTING_STAR_ACTIVE_SECONDS;
      const progress = isActive ? cycleTime / SHOOTING_STAR_ACTIVE_SECONDS : 0;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const opacity = isActive
        ? Math.sin(progress * Math.PI) * SHOOTING_STAR_MAX_OPACITY
        : 0;

      refs.group.position.set(
        SHOOTING_STAR_START_X - easedProgress * SHOOTING_STAR_TRAVEL_X,
        SHOOTING_STAR_START_Y + star.yOffset,
        SHOOTING_STAR_START_Z + star.zOffset + easedProgress * SHOOTING_STAR_TRAVEL_Z
      );
      refs.tail.opacity = opacity;
      refs.head.opacity = opacity;
    }
  });

  return (
    <group rotation-y={-0.34} rotation-z={-0.12}>
      {stars.map((star) => (
        <group
          key={star.id}
          ref={(group) => {
            starRefs.current[star.id].group = group;
          }}
        >
          <lineSegments geometry={tailGeometry}>
            <lineBasicMaterial
              ref={(material) => {
                starRefs.current[star.id].tail = material;
              }}
              color={SHOOTING_STAR_COLOR}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
          <points geometry={headGeometry}>
            <pointsMaterial
              ref={(material) => {
                starRefs.current[star.id].head = material;
              }}
              color={SHOOTING_STAR_COLOR}
              size={SHOOTING_STAR_HEAD_SIZE}
              sizeAttenuation
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      ))}
    </group>
  );
};

export default ShootingStars;
