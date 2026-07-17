import * as THREE from "three";
import type { Season } from "@/contexts";

export interface RipplePoint {
  id: number;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  startTime: number;
}

export interface DropletParticle {
  id: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  size: number;
  petalLike: boolean;
  petalRotation: number;
  petalSpin: number;
  startTime: number;
}

export const DROPLET_LIFETIME = 0.82;
export const DROPLET_GRAVITY = 2.6;
export const RIPPLE_SPARKLE_INDICES = [0, 1, 2, 3, 4, 5, 6] as const;

export const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

export const createPetalGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1);
  shape.bezierCurveTo(0.58, 0.86, 0.84, 0.22, 0.34, -0.26);
  shape.quadraticCurveTo(0.12, -0.44, 0, -0.92);
  shape.quadraticCurveTo(-0.12, -0.44, -0.34, -0.26);
  shape.bezierCurveTo(-0.84, 0.22, -0.58, 0.86, 0, 1);

  const geometry = new THREE.ShapeGeometry(shape, 24);
  geometry.center();
  return geometry;
};

export const getRipplePalette = (season: Season) => {
  switch (season) {
    case "spring":
      return {
        ring: "#ffd8f0",
        glow: "#fff1fb",
      };
    case "summer":
      return {
        ring: "#b8f1ff",
        glow: "#effcff",
      };
    case "autumn":
      return {
        ring: "#ffd5a3",
        glow: "#fff2dc",
      };
    case "winter":
      return {
        ring: "#dcecff",
        glow: "#f6fbff",
      };
  }
};

export const getRippleTuning = (season: Season) => {
  switch (season) {
    case "spring":
      return {
        dropletCount: 5,
        dropletLift: 0.92,
        dropletSpread: 0.9,
        ringOpacity: 0.13,
        sparkleOpacity: 0.48,
        petalChance: 0.92,
      };
    case "summer":
      return {
        dropletCount: 9,
        dropletLift: 1.24,
        dropletSpread: 1.18,
        ringOpacity: 0.15,
        sparkleOpacity: 0.58,
        petalChance: 0,
      };
    case "autumn":
      return {
        dropletCount: 5,
        dropletLift: 0.9,
        dropletSpread: 0.9,
        ringOpacity: 0.12,
        sparkleOpacity: 0.38,
        petalChance: 0.58,
      };
    case "winter":
      return {
        dropletCount: 5,
        dropletLift: 0.82,
        dropletSpread: 0.76,
        ringOpacity: 0.11,
        sparkleOpacity: 0.42,
        petalChance: 0,
      };
  }
};
