import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  METEOR_ACTIVE_SECONDS,
  METEOR_COLOR,
  METEOR_CYCLE_SECONDS,
  METEOR_FIRST_DELAY_SECONDS,
  METEOR_GLOW_SIZE,
  METEOR_MAX_OPACITY,
  METEOR_PATHS,
  METEOR_TRAIL_LENGTH,
  METEOR_TRAIL_WIDTH,
} from "@/constants/shootingStars";

interface MeteorRefs {
  group: THREE.Group | null;
  trail: THREE.MeshBasicMaterial | null;
  glow: THREE.PointsMaterial | null;
}

const createTrailTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 48;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const centerY = canvas.height / 2;
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255, 246, 214, 0)");
  gradient.addColorStop(0.42, "rgba(255, 246, 214, 0.08)");
  gradient.addColorStop(0.78, "rgba(255, 246, 214, 0.42)");
  gradient.addColorStop(1, "rgba(255, 255, 244, 1)");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.shadowColor = "rgba(255, 246, 214, 0.75)";
  context.shadowBlur = 10;
  context.strokeStyle = gradient;
  context.lineWidth = 3;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(4, centerY);
  context.lineTo(canvas.width - 8, centerY);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
};

/**
 * 夜空をまれに横切る、細く短い流星。
 */
const ShootingStars: React.FC = () => {
  const refs = useRef<MeteorRefs>({
    group: null,
    trail: null,
    glow: null,
  });

  const trailTexture = useMemo(createTrailTexture, []);
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      METEOR_TRAIL_LENGTH,
      METEOR_TRAIL_WIDTH
    );
    geometry.translate(-METEOR_TRAIL_LENGTH / 2, 0, 0);
    return geometry;
  }, []);

  const glowGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    return geometry;
  }, []);

  const meteorPaths = useMemo(() => {
    const xAxis = new THREE.Vector3(1, 0, 0);

    return METEOR_PATHS.map((path) => {
      const start = new THREE.Vector3(...path.start);
      const end = new THREE.Vector3(...path.end);
      const direction = new THREE.Vector3().subVectors(end, start).normalize();

      return {
        start,
        end,
        quaternion: new THREE.Quaternion().setFromUnitVectors(xAxis, direction),
      };
    });
  }, []);

  const currentPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!refs.current.group || !refs.current.trail || !refs.current.glow) {
      return;
    }

    const elapsed = state.clock.getElapsedTime() - METEOR_FIRST_DELAY_SECONDS;
    const isPastFirstDelay = elapsed >= 0;
    const cycleTime = isPastFirstDelay ? elapsed % METEOR_CYCLE_SECONDS : METEOR_CYCLE_SECONDS;
    const isActive = cycleTime < METEOR_ACTIVE_SECONDS;
    const progress = isActive ? cycleTime / METEOR_ACTIVE_SECONDS : 0;
    const pathIndex = isPastFirstDelay
      ? Math.floor(elapsed / METEOR_CYCLE_SECONDS) % meteorPaths.length
      : 0;
    const path = meteorPaths[pathIndex];
    const opacity = isActive
      ? Math.sin(progress * Math.PI) * METEOR_MAX_OPACITY
      : 0;

    currentPosition
      .copy(path.start)
      .lerp(path.end, 1 - Math.pow(1 - progress, 2));

    refs.current.group.position.copy(currentPosition);
    refs.current.group.quaternion.copy(path.quaternion);
    refs.current.trail.opacity = opacity;
    refs.current.glow.opacity = opacity * 0.9;
  });

  return (
    <group
      ref={(group) => {
        refs.current.group = group;
      }}
      visible={Boolean(trailTexture)}
    >
      <mesh geometry={trailGeometry}>
        <meshBasicMaterial
          ref={(material) => {
            refs.current.trail = material;
          }}
          map={trailTexture}
          color={METEOR_COLOR}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <points geometry={glowGeometry}>
        <pointsMaterial
          ref={(material) => {
            refs.current.glow = material;
          }}
          color={METEOR_COLOR}
          size={METEOR_GLOW_SIZE}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default ShootingStars;
