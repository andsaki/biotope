import * as THREE from "three";
import {
  FISH_BOUNDARY,
  FISH_MOVEMENT,
  FLATFISH_GROUND_Y,
  FLATFISH_MOVE_TIME_MIN,
  FLATFISH_MOVE_TIME_VARIATION,
  FLATFISH_WAIT_TIME_MIN,
  FLATFISH_WAIT_TIME_VARIATION,
} from "@/constants/fish";
import type { Fish } from "./types";

interface FishMotionContext {
  delta: number;
  elapsedTime: number;
  weatherDepthOffset: number;
  weatherSpeedMultiplier: number;
}

const normalizeAngle = (angle: number) =>
  THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI;

const dampAngle = (current: number, target: number, damping: number, delta: number) =>
  current + normalizeAngle(target - current) * (1 - Math.exp(-damping * delta));

export const createDirectionChangeTime = () =>
  FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_MIN +
  Math.random() * FISH_MOVEMENT.DIRECTION_CHANGE_INTERVAL_VARIATION;

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
  const { delta, weatherSpeedMultiplier } = context;
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
        (Math.random() - 0.5) * FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE;
      newWaitTime = FLATFISH_MOVE_TIME_MIN + Math.random() * FLATFISH_MOVE_TIME_VARIATION;
    } else {
      newIsMoving = false;
      newWaitTime = FLATFISH_WAIT_TIME_MIN + Math.random() * FLATFISH_WAIT_TIME_VARIATION;
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
      fish.speed * weatherSpeedMultiplier * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
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
  const { delta, elapsedTime, weatherDepthOffset, weatherSpeedMultiplier } = context;

  fish.directionChangeTime -= delta;
  if (fish.directionChangeTime <= 0) {
    fish.targetDirectionX +=
      (Math.random() - 0.5) * FISH_MOVEMENT.DIRECTION_CHANGE_ANGLE_RANGE;
    fish.directionChangeTime = createDirectionChangeTime();
  }

  if (steerTowardCenterIfNeeded(fish, FISH_MOVEMENT.BOUNDARY_MARGIN)) {
    fish.directionChangeTime = createDirectionChangeTime();
  }

  fish.directionX = dampAngle(
    fish.directionX,
    fish.targetDirectionX,
    FISH_MOVEMENT.TURN_DAMPING,
    delta
  );

  const travelDistance =
    fish.speed * weatherSpeedMultiplier * delta * FISH_MOVEMENT.FRAME_MULTIPLIER;
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
