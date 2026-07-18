import {
  LILY_DATA,
} from "../constants/waterPlants";

export const POTTED_PLANT_SPOTS: ReadonlyArray<{ position: [number, number, number] }> = [
  { position: [-6, 0.5, -5] },
];

export const RESTING_SPOTS = [
  ...LILY_DATA.map((lily, i) => ({ position: lily.position, type: "lily" as const, index: i })),
  ...POTTED_PLANT_SPOTS.map((plant, i) => ({
    position: plant.position,
    type: "plant" as const,
    index: i + LILY_DATA.length,
  })),
];

export const FIREFLY_COUNT = 18;
export const FIREFLY_COLOR = "#CDFF00";
export const FIREFLY_SIZE = 0.08;
export const FIREFLY_SIZE_VARIATION = 0.04;
export const RESTING_DURATION_MIN = 3;
export const RESTING_DURATION_MAX = 6;
export const FLYING_DURATION_MIN = 8;
export const FLYING_DURATION_MAX = 15;
export const IDEAL_FRAME_TIME = 1 / 60;
export const TRAIL_SEGMENTS = 10;
export const TRAIL_FADE = 0.75;
export const CAMERA_DISTANCE_FALLOFF = 28;
export const DISTANCE_BRIGHTNESS_MIN = 0.7;
export const DISTANCE_BRIGHTNESS_MAX = 2.0;
export const GLOBAL_BREEZE_STRENGTH = 0.0015;
export const TRAIL_INSTANCE_COUNT = FIREFLY_COUNT * TRAIL_SEGMENTS;
export const GLOW_SIZE_MULTIPLIER = 2.5;

export const SPAWN_AREA = {
  X_MIN: -8,
  X_MAX: 8,
  Y_MIN: 9,
  Y_MAX: 12,
  Z_MIN: -8,
  Z_MAX: 8,
};

export const SPEED = {
  BASE: 0.018,
  VARIATION: 0.005,
};

export const BLINK_PATTERNS = ["single", "double", "breather"] as const;
export type BlinkPattern = (typeof BLINK_PATTERNS)[number];

export interface Firefly {
  id: number;
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  time: number;
  frequencyX: number;
  frequencyY: number;
  frequencyZ: number;
  amplitudeX: number;
  amplitudeY: number;
  amplitudeZ: number;
  phase: number;
  phaseSpeed: number;
  isResting: boolean;
  restingTime: number;
  flyingTime: number;
  targetRestDuration: number;
  targetFlyDuration: number;
  targetSpotIndex: number | null;
  blinkType: BlinkPattern;
  blinkOffset: number;
  colorComponents: [number, number, number];
  trail: number[];
  size: number;
}

const wrapPhase = (phase: number) => {
  const twoPi = Math.PI * 2;
  const normalized = phase % twoPi;
  return normalized >= 0 ? normalized : normalized + twoPi;
};

export const computeBlinkBrightness = (
  phase: number,
  type: BlinkPattern,
  offset: number
) => {
  const normalizedPhase = wrapPhase(phase + offset);
  switch (type) {
    case "double": {
      const primary = Math.sin(normalizedPhase);
      const baseGlow = primary > 0 ? Math.pow(primary, 1.8) : 0;
      const echo = Math.sin(normalizedPhase * 2.1 + 0.9);
      const echoGlow = echo > 0 ? Math.pow(echo, 1.5) * 0.7 : 0;
      return 0.15 + (baseGlow + echoGlow) * 1.5;
    }
    case "breather": {
      const slowWave = (Math.sin(normalizedPhase * 0.5) + 1) / 2;
      return 0.3 + Math.pow(slowWave, 2.5) * 1.2;
    }
    case "single":
    default: {
      const sinValue = Math.sin(normalizedPhase);
      return sinValue > 0 ? Math.pow(sinValue, 1.8) * 1.5 + 0.15 : 0.15;
    }
  }
};
