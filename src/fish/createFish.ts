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
import { createDirectionChangeTime } from "./movement";
import type { Fish } from "./types";

export const getSeasonFishProfile = (season: Season) => {
  switch (season) {
    case "spring":
      return { fishSpeed: FISH_SPEED.SPRING, fishColor: FISH_COLOR.SPRING, fishAccentColor: FISH_ACCENT_COLOR.SPRING };
    case "summer":
      return { fishSpeed: FISH_SPEED.SUMMER, fishColor: FISH_COLOR.SUMMER, fishAccentColor: FISH_ACCENT_COLOR.SUMMER };
    case "autumn":
      return { fishSpeed: FISH_SPEED.AUTUMN, fishColor: FISH_COLOR.AUTUMN, fishAccentColor: FISH_ACCENT_COLOR.AUTUMN };
    case "winter":
      return { fishSpeed: FISH_SPEED.WINTER, fishColor: FISH_COLOR.WINTER, fishAccentColor: FISH_ACCENT_COLOR.WINTER };
  }
};

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const createNormalFish = (id: number, fishSpeed: number, fishColor: string): Fish => {
  const direction = Math.random() * Math.PI * 2;
  const cruiseY = randomBetween(NORMAL_FISH_SPAWN.Y_MIN, NORMAL_FISH_SPAWN.Y_MAX);

  return {
    id,
    x: randomBetween(NORMAL_FISH_SPAWN.X_MIN, NORMAL_FISH_SPAWN.X_MAX),
    y: cruiseY,
    z: randomBetween(NORMAL_FISH_SPAWN.Z_MIN, NORMAL_FISH_SPAWN.Z_MAX),
    speed: fishSpeed + (Math.random() * NORMAL_FISH_SPEED_VARIATION - NORMAL_FISH_SPEED_VARIATION / 2),
    directionX: direction,
    directionY: 0,
    targetDirectionX: direction,
    cruiseY,
    swimPhase: Math.random() * Math.PI * 2,
    directionChangeTime: createDirectionChangeTime(),
    color: fishColor,
    size: NORMAL_FISH_SIZE_MIN + Math.random() * NORMAL_FISH_SIZE_VARIATION,
    type: "normal",
  };
};

const createFlatfish = (id: number, fishColor: string): Fish => {
  const direction = Math.random() * Math.PI * 2;

  return {
    id,
    x: randomBetween(NORMAL_FISH_SPAWN.X_MIN, NORMAL_FISH_SPAWN.X_MAX),
    y: FLATFISH_GROUND_Y,
    z: randomBetween(NORMAL_FISH_SPAWN.Z_MIN, NORMAL_FISH_SPAWN.Z_MAX),
    speed: FLATFISH_SPEED,
    directionX: direction,
    directionY: 0,
    targetDirectionX: direction,
    cruiseY: FLATFISH_GROUND_Y,
    swimPhase: 0,
    directionChangeTime: createDirectionChangeTime(),
    color: fishColor,
    size: FLATFISH_SIZE_MIN + Math.random() * FLATFISH_SIZE_VARIATION,
    type: "flatfish",
    waitTime: FLATFISH_WAIT_TIME_MIN + Math.random() * FLATFISH_WAIT_TIME_VARIATION,
    isMoving: false,
  };
};

export const createFishList = (season: Season): Fish[] => {
  const { fishSpeed, fishColor } = getSeasonFishProfile(season);
  const normalFish = Array.from({ length: NORMAL_FISH_COUNT }, (_, index) =>
    createNormalFish(index, fishSpeed, fishColor)
  );
  const flatfish = Array.from({ length: FLATFISH_COUNT }, (_, index) =>
    createFlatfish(NORMAL_FISH_COUNT + index, fishColor)
  );

  return [...normalFish, ...flatfish];
};
