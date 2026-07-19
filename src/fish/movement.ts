import * as THREE from "three";
import {
  FISH_BOUNDARY,
  FISH_MOVEMENT,
  FISH_STARTLE,
  FLATFISH_GROUND_Y,
  FLATFISH_MOVE_TIME_MIN,
  FLATFISH_MOVE_TIME_VARIATION,
  FLATFISH_WAIT_TIME_MIN,
  FLATFISH_WAIT_TIME_VARIATION,
} from "@/constants/fish";
import { createRng, randomBetween, type RngFunction } from "@/utils/random";
import type { Fish } from "./types";

interface FishMotionContext {
  delta: number;
  elapsedTime: number;
  weatherDepthOffset: number;
  weatherSpeedMultiplier: number;
  waterReactionStrength: number;
}

const normalizeAngle = (angle: number) =>
  THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI;

const dampAngle = (current: number, target: number, damping: number, delta: number) =>
  current + normalizeAngle(target - current) * (1 - Math.exp(-damping * delta));

export const createDirectionChangeTime = (rng: RngFunction) =>
  randomBetween(
    rng,
    FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_MIN,
    FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_MIN +
      FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_VARIATION
  );

const nextFishRandom = (fish: Fish) => {
  const rng = createRng(fish.movementSeed + fish.movementStep * 0x9e3779b1);
  fish.movementStep += 1;
  return rng();
};

/** クリックされた魚を驚かせ、逃げる向きへ切り替えて速度ブーストを与える */
export const startleFish = (fish: Fish) => {
  const jitter = (nextFishRandom(fish) - 0.5) * FISH_STARTLE.TURN_JITTER;
  fish.targetDirectionX = fish.directionX + Math.PI + jitter;
  fish.directionChangeTime = FISH_STARTLE.COMMIT_SECONDS;
  fish.startleTime = FISH_STARTLE.DURATION_SECONDS;
  if (fish.type === "flatfish") {
    fish.isMoving = true;
    fish.waitTime = FLATFISH_MOVE_TIME_MIN;
  }
};

/** 驚き状態の残り時間を減衰させ、速度倍率への上乗せ量を返す */
const consumeStartleBoost = (fish: Fish, delta: number) => {
  if (fish.startleTime <= 0) {
    return 0;
  }
  const strength = Math.min(1, fish.startleTime / FISH_STARTLE.DURATION_SECONDS);
  fish.startleTime = Math.max(0, fish.startleTime - delta);
  return strength * FISH_STARTLE.SPEED_BOOST;
};

const steerTowardCenterIfNeeded = (fish: Fish, margin: number) => {
  const nearBoundary =
    fish.x < FISH_BOUNDARY.X_MIN + margin ||
    fish.x > FISH_BOUNDARY.X_MAX - margin ||
    fish.z < FISH_BOUNDARY.Z_MIN + margin ||
    fish.z > FISH_BOUNDARY.Z_MAX - margin;

  if (!nearBoundary) {
    return false;
  }

  const centerX = (FISH_BOUNDARY.X_MIN + FISH_BOUNDARY.X_MAX) / 2;
  const centerZ = (FISH_BOUNDARY.Z_MIN + FISH_BOUNDARY.Z_MAX) / 2;
  fish.targetDirectionX = Math.atan2(centerZ - fish.z, centerX - fish.x);
  return true;
};

const updateFlatfishMovement = (fish: Fish, context: FishMotionContext) => {
  const { delta, weatherSpeedMultiplier, waterReactionStrength } = context;
  const startleBoost = consumeStartleBoost(fish, delta);
  let newWaitTime = fish.waitTime ?? 0;
  let newIsMoving = fish.isMoving ?? false;
  let newX = fish.x;
  let newZ = fish.z;

  newWaitTime -= delta;

  if (newWaitTime <= 0) {
    if (!newIsMoving) {
      newIsMoving = true;
      fish.targetDirectionX =
        fish.directionX +
        (nextFishRandom(fish) - 0.5) * FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE;
      newWaitTime =
        FLATFISH_MOVE_TIME_MIN +
        nextFishRandom(fish) * FLATFISH_MOVE_TIME_VARIATION;
    } else {
      newIsMoving = false;
      newWaitTime =
        FLATFISH_WAIT_TIME_MIN +
        nextFishRandom(fish) * FLATFISH_WAIT_TIME_VARIATION;
    }
  }

  if (newIsMoving) {
    steerTowardCenterIfNeeded(fish, FISH_MOVEMENT.FLATFISH_BOUNDARY_MARGIN);

    fish.directionX = dampAngle(
      fish.directionX,
      fish.targetDirectionX,
      FISH_MOVEMENT.FLATFISH_TURN_DAMPING,
      delta
    );

    const travelDistance =
      fish.speed *
      weatherSpeedMultiplier *
      (1 + waterReactionStrength * 0.16 + startleBoost) *
      delta *
      FISH_MOVEMENT.FRAME_MULTIPLIER;
    newX = THREE.MathUtils.clamp(
      fish.x + Math.cos(fish.directionX) * travelDistance,
      FISH_BOUNDARY.X_MIN,
      FISH_BOUNDARY.X_MAX
    );
    newZ = THREE.MathUtils.clamp(
      fish.z +
        Math.sin(fish.directionX) *
          travelDistance *
          FISH_MOVEMENT.FLATFISH_Z_DRIFT_DAMPING,
      FISH_BOUNDARY.Z_MIN,
      FISH_BOUNDARY.Z_MAX
    );
  }

  fish.x = newX;
  fish.y = FLATFISH_GROUND_Y;
  fish.z = newZ;
  fish.waitTime = newWaitTime;
  fish.isMoving = newIsMoving;
};

const updateNormalFishMovement = (fish: Fish, context: FishMotionContext) => {
  const { delta, elapsedTime, weatherDepthOffset, weatherSpeedMultiplier, waterReactionStrength } = context;
  const startleBoost = consumeStartleBoost(fish, delta);

  fish.directionChangeTime -= delta;
  if (fish.directionChangeTime <= 0) {
    fish.targetDirectionX +=
      (nextFishRandom(fish) - 0.5) *
      FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE;
    fish.directionChangeTime =
      FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_MIN +
      nextFishRandom(fish) * FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_VARIATION;
  }

  if (steerTowardCenterIfNeeded(fish, FISH_MOVEMENT.BOUNDARY_MARGIN)) {
    fish.directionChangeTime =
      FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_MIN +
      nextFishRandom(fish) * FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_VARIATION;
  }

  fish.directionX = dampAngle(
    fish.directionX,
    fish.targetDirectionX,
    FISH_MOVEMENT.TURN_DAMPING,
    delta
  );

  const travelDistance =
    fish.speed *
    weatherSpeedMultiplier *
    (1 + waterReactionStrength * 0.38 + startleBoost) *
    delta *
    FISH_MOVEMENT.FRAME_MULTIPLIER;
  const newX = THREE.MathUtils.clamp(
    fish.x + Math.cos(fish.directionX) * travelDistance,
    FISH_BOUNDARY.X_MIN,
    FISH_BOUNDARY.X_MAX
  );
  const newZ = THREE.MathUtils.clamp(
    fish.z + Math.sin(fish.directionX) * travelDistance * FISH_MOVEMENT.Z_DRIFT_DAMPING,
    FISH_BOUNDARY.Z_MIN,
    FISH_BOUNDARY.Z_MAX
  );
  const targetY = THREE.MathUtils.clamp(
    fish.cruiseY +
      weatherDepthOffset +
      Math.sin(elapsedTime * FISH_MOVEMENT.SWIM_OSCILLATION_SPEED + fish.swimPhase) *
        FISH_MOVEMENT.SWIM_OSCILLATION_AMPLITUDE,
    FISH_BOUNDARY.Y_MIN,
    FISH_BOUNDARY.Y_MAX
  );
  const newY = THREE.MathUtils.damp(
    fish.y,
    targetY,
    FISH_MOVEMENT.DEPTH_DAMPING,
    delta
  );

  fish.x = newX;
  fish.y = newY;
  fish.z = newZ;
};

export const updateFishMovement = (fish: Fish, context: FishMotionContext) => {
  if (fish.type === "flatfish") {
    updateFlatfishMovement(fish, context);
    return;
  }

  updateNormalFishMovement(fish, context);
};
