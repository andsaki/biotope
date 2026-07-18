import type { Season } from "@/contexts";
import {
  FISH_ACCENT_COLOR,
  FISH_COLOR,
  FISH_SPEED,
  FLATFISH_COUNT,
  FLATFISH_GROUND_Y,
  FLATFISH_SIZE_MIN,
  FLATFISH_SIZE_VARIATION,
  FLATFISH_SPEED,
  FLATFISH_WAIT_TIME_MIN,
  FLATFISH_WAIT_TIME_VARIATION,
  NORMAL_FISH_COUNT,
  NORMAL_FISH_SIZE_MIN,
  NORMAL_FISH_SIZE_VARIATION,
  NORMAL_FISH_SPAWN,
  NORMAL_FISH_SPEED_VARIATION,
} from "@/constants/fish";
import { createRng, createSeedFromString, randomBetween, type RngFunction } from "@/utils/random";
import { createDirectionChangeTime } from "./movement";
import type { Fish } from "./types";

interface SeasonFishProfile {
  fishSpeed: number;
  fishColor: string;
  fishAccentColor: string;
  normalCount: number;
  flatfishCount: number;
}

const SEASON_FISH_PROFILES: Record<Season, SeasonFishProfile> = {
  spring: {
    fishSpeed: FISH_SPEED.SPRING,
    fishColor: FISH_COLOR.SPRING,
    fishAccentColor: FISH_ACCENT_COLOR.SPRING,
    normalCount: NORMAL_FISH_COUNT,
    flatfishCount: FLATFISH_COUNT,
  },
  summer: {
    fishSpeed: FISH_SPEED.SUMMER,
    fishColor: FISH_COLOR.SUMMER,
    fishAccentColor: FISH_ACCENT_COLOR.SUMMER,
    normalCount: NORMAL_FISH_COUNT + 3,
    flatfishCount: FLATFISH_COUNT,
  },
  autumn: {
    fishSpeed: FISH_SPEED.AUTUMN,
    fishColor: FISH_COLOR.AUTUMN,
    fishAccentColor: FISH_ACCENT_COLOR.AUTUMN,
    normalCount: NORMAL_FISH_COUNT - 2,
    flatfishCount: FLATFISH_COUNT + 1,
  },
  winter: {
    fishSpeed: FISH_SPEED.WINTER,
    fishColor: FISH_COLOR.WINTER,
    fishAccentColor: FISH_ACCENT_COLOR.WINTER,
    normalCount: NORMAL_FISH_COUNT - 4,
    flatfishCount: FLATFISH_COUNT + 1,
  },
};

export const getSeasonFishProfile = (season: Season) =>
  SEASON_FISH_PROFILES[season];

const createNormalFish = (
  id: number,
  fishSpeed: number,
  fishColor: string,
  rng: RngFunction
): Fish => {
  const direction = randomBetween(rng, 0, Math.PI * 2);
  const cruiseY = randomBetween(rng, NORMAL_FISH_SPAWN.Y_MIN, NORMAL_FISH_SPAWN.Y_MAX);

  return {
    id,
    x: randomBetween(rng, NORMAL_FISH_SPAWN.X_MIN, NORMAL_FISH_SPAWN.X_MAX),
    y: cruiseY,
    z: randomBetween(rng, NORMAL_FISH_SPAWN.Z_MIN, NORMAL_FISH_SPAWN.Z_MAX),
    speed: fishSpeed + randomBetween(rng, -NORMAL_FISH_SPEED_VARIATION / 2, NORMAL_FISH_SPEED_VARIATION / 2),
    directionX: direction,
    directionY: 0,
    targetDirectionX: direction,
    cruiseY,
    swimPhase: randomBetween(rng, 0, Math.PI * 2),
    directionChangeTime: createDirectionChangeTime(rng),
    movementSeed: Math.floor(randomBetween(rng, 0, 0xffffffff)),
    movementStep: 0,
    color: fishColor,
    size: randomBetween(rng, NORMAL_FISH_SIZE_MIN, NORMAL_FISH_SIZE_MIN + NORMAL_FISH_SIZE_VARIATION),
    type: "normal",
  };
};

const createFlatfish = (id: number, fishColor: string, rng: RngFunction): Fish => {
  const direction = randomBetween(rng, 0, Math.PI * 2);

  return {
    id,
    x: randomBetween(rng, NORMAL_FISH_SPAWN.X_MIN, NORMAL_FISH_SPAWN.X_MAX),
    y: FLATFISH_GROUND_Y,
    z: randomBetween(rng, NORMAL_FISH_SPAWN.Z_MIN, NORMAL_FISH_SPAWN.Z_MAX),
    speed: FLATFISH_SPEED,
    directionX: direction,
    directionY: 0,
    targetDirectionX: direction,
    cruiseY: FLATFISH_GROUND_Y,
    swimPhase: 0,
    directionChangeTime: createDirectionChangeTime(rng),
    movementSeed: Math.floor(randomBetween(rng, 0, 0xffffffff)),
    movementStep: 0,
    color: fishColor,
    size: randomBetween(rng, FLATFISH_SIZE_MIN, FLATFISH_SIZE_MIN + FLATFISH_SIZE_VARIATION),
    type: "flatfish",
    waitTime: randomBetween(rng, FLATFISH_WAIT_TIME_MIN, FLATFISH_WAIT_TIME_MIN + FLATFISH_WAIT_TIME_VARIATION),
    isMoving: false,
  };
};

export const createFishList = (season: Season): Fish[] => {
  const { fishSpeed, fishColor, normalCount, flatfishCount } = getSeasonFishProfile(season);
  const rng = createRng(createSeedFromString(`fish:${season}`));
  const normalFish = Array.from({ length: normalCount }, (_, index) =>
    createNormalFish(index, fishSpeed, fishColor, rng)
  );
  const flatfish = Array.from({ length: flatfishCount }, (_, index) =>
    createFlatfish(normalCount + index, fishColor, rng)
  );

  return [...normalFish, ...flatfish];
};
