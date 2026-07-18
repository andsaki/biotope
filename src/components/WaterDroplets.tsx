import * as THREE from "three";
import {
  DROPLET_GRAVITY,
  DROPLET_LIFETIME,
  type DropletParticle,
} from "./waterSurfaceEffects";

interface RipplePalette {
  ring: string;
  glow: string;
}

interface WaterDropletsProps {
  droplets: readonly DropletParticle[];
  elapsedTime: number;
  ripplePalette: RipplePalette;
  petalGeometry: THREE.ShapeGeometry;
  dropletGeometry: THREE.SphereGeometry;
}

export const WaterDroplets = ({
  droplets,
  elapsedTime,
  ripplePalette,
  petalGeometry,
  dropletGeometry,
}: WaterDropletsProps) => (
  <>
    {droplets.map((droplet) => {
      const age = elapsedTime - droplet.startTime;
      const progress = Math.min(1, Math.max(0, age / DROPLET_LIFETIME));
      const lateralDrift = droplet.petalLike
        ? Math.sin(progress * Math.PI * 2.2 + droplet.id) * 0.08
        : 0;
      const x = droplet.worldX + droplet.velocityX * age * 7 + lateralDrift;
      const y =
        droplet.worldY +
        droplet.velocityY * age * 4 -
        0.5 * DROPLET_GRAVITY * age * age;
      const z =
        droplet.worldZ +
        droplet.velocityZ * age * 7 +
        (droplet.petalLike ? lateralDrift * 0.35 : 0);
      const opacity = Math.max(0, (1 - progress) * 0.72);
      const scale = droplet.size * (1 - progress * 0.35);
      const petalWobble = droplet.petalLike
        ? Math.sin(age * 10 + droplet.id) * 0.18
        : 0;

      return (
        <group key={droplet.id} position={[x, y, z]} renderOrder={22}>
          <mesh
            rotation={
              droplet.petalLike
                ? [0, age * 1.4 + petalWobble, droplet.petalRotation + age * droplet.petalSpin]
                : [0, 0, 0]
            }
            scale={droplet.petalLike ? [scale * 0.95, scale * 1.55, 1] : [scale, scale, scale]}
          >
            {droplet.petalLike ? (
              <primitive object={petalGeometry} attach="geometry" />
            ) : (
              <primitive object={dropletGeometry} attach="geometry" />
            )}
            <meshBasicMaterial
              color={droplet.petalLike ? ripplePalette.ring : ripplePalette.glow}
              transparent={true}
              opacity={opacity}
              depthWrite={false}
              depthTest={true}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      );
    })}
  </>
);
