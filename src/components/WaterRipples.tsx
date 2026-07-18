import * as THREE from "three";
import { WATER_RIPPLE_LIFETIME } from "@/constants/waterSurface";
import {
  pseudoRandom,
  RIPPLE_SPARKLE_INDICES,
  type RipplePoint,
} from "./waterSurfaceEffects";

interface RipplePalette {
  ring: string;
  glow: string;
}

interface RippleTuning {
  ringOpacity: number;
  sparkleOpacity: number;
}

interface WaterRipplesProps {
  ripples: readonly RipplePoint[];
  elapsedTime: number;
  ripplePalette: RipplePalette;
  rippleTuning: RippleTuning;
  rippleRingGeometry: THREE.RingGeometry;
  sparkleGeometry: THREE.CircleGeometry;
}

export const WaterRipples = ({
  ripples,
  elapsedTime,
  ripplePalette,
  rippleTuning,
  rippleRingGeometry,
  sparkleGeometry,
}: WaterRipplesProps) => (
  <>
    {ripples.map((ripple) => {
      const age = elapsedTime - ripple.startTime;
      const progress = Math.min(1, Math.max(0, age / WATER_RIPPLE_LIFETIME));
      const easeOut = 1 - Math.pow(1 - progress, 2.4);
      const mainRadius = 0.36 + easeOut * 1.85;
      const mainOpacity = Math.max(0, (1 - progress) * rippleTuning.ringOpacity);
      const impactOpacity = Math.max(
        0,
        (1 - progress * 1.9) * rippleTuning.sparkleOpacity * 0.85
      );
      const impactScale = 0.1 + easeOut * 0.28;
      const trailingProgress = Math.min(1, Math.max(0, (progress - 0.12) / 0.88));
      const trailingRadius = 0.24 + trailingProgress * 1.12;
      const trailingOpacity = Math.max(
        0,
        (1 - trailingProgress) * rippleTuning.ringOpacity * 0.4
      );
      const sparkleOpacity = Math.max(0, (1 - progress) * rippleTuning.sparkleOpacity);
      const sparklePhase = progress * Math.PI * 0.9 + ripple.id * 0.19;

      return (
        <group key={ripple.id} position={[ripple.worldX, ripple.worldY + 0.018, ripple.worldZ]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[impactScale, impactScale, 1]} renderOrder={18}>
            <primitive object={sparkleGeometry} attach="geometry" />
            <meshBasicMaterial
              color={ripplePalette.glow}
              transparent={true}
              opacity={impactOpacity}
              depthWrite={false}
              depthTest={true}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[mainRadius, mainRadius, 1]} renderOrder={19}>
            <primitive object={rippleRingGeometry} attach="geometry" />
            <meshBasicMaterial
              color={ripplePalette.ring}
              transparent={true}
              opacity={mainOpacity}
              depthWrite={false}
              depthTest={true}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {trailingOpacity > 0 && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[trailingRadius, trailingRadius, 1]}
              renderOrder={20}
            >
              <primitive object={rippleRingGeometry} attach="geometry" />
              <meshBasicMaterial
                color={ripplePalette.glow}
                transparent={true}
                opacity={trailingOpacity}
                depthWrite={false}
                depthTest={true}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}

          {RIPPLE_SPARKLE_INDICES.map((index) => {
            const seed = ripple.id * 17 + index * 31;
            const angle = sparklePhase + pseudoRandom(seed) * Math.PI * 2;
            const sparkleRadius = 0.14 + easeOut * (0.85 + pseudoRandom(seed + 1) * 0.7);
            const sparkleScale =
              0.012 + pseudoRandom(seed + 2) * 0.018 + (1 - progress) * 0.008;
            const verticalOffset = (pseudoRandom(seed + 3) - 0.5) * 0.018;
            const dropletRotation = pseudoRandom(seed + 4) * Math.PI;
            return (
              <mesh
                key={`${ripple.id}-sparkle-${index}`}
                position={[
                  Math.cos(angle) * sparkleRadius,
                  0.008 + verticalOffset,
                  Math.sin(angle) * sparkleRadius,
                ]}
                rotation={[-Math.PI / 2, 0, dropletRotation]}
                scale={[sparkleScale * 0.7, sparkleScale * 1.35, 1]}
                renderOrder={21}
              >
                <primitive object={sparkleGeometry} attach="geometry" />
                <meshBasicMaterial
                  color={ripplePalette.glow}
                  transparent={true}
                  opacity={sparkleOpacity}
                  depthWrite={false}
                  depthTest={true}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            );
          })}
        </group>
      );
    })}
  </>
);
