/**
 * ライティング設定の定数
 */

// LightingController - 季節ごとのライト設定
export const LIGHTING_TRANSITION_SPEED = 2;

// 昼夜の基本強度
export const DAY_INTENSITY = {
  directional: {
    default: 5.0,
    summer: 6.0,
    winter: 4.0,
  },
  ambient: 0.5,
  point: 0.5,
  spot: 1.0,
} as const;

export const NIGHT_INTENSITY = {
  directional: {
    default: 1.0,
    summer: 1.0,
    winter: 0.8,
  },
  ambient: 0.3,
  point: 0.4,
  spot: 0.6,
} as const;

// 季節ごとの色設定
export const SEASON_COLORS = {
  spring: {
    day: {
      directional: "#FFFACD",
      ambient: "#E6F3FF",
    },
    night: {
      directional: "#CCCCCC",
      ambient: "#333333",
    },
  },
  summer: {
    day: {
      directional: "#FFE55C",
      ambient: "#87CEEB",
    },
    night: {
      directional: "#B0C4DE",
      ambient: "#2F4F4F",
    },
  },
  autumn: {
    day: {
      directional: "#FFA500",
      ambient: "#DEB887",
    },
    night: {
      directional: "#A9A9A9",
      ambient: "#3A3A3A",
    },
  },
  winter: {
    day: {
      directional: "#E0F7FA",
      ambient: "#B0E0E6",
    },
    night: {
      directional: "#778899",
      ambient: "#2C2C2C",
    },
  },
} as const;

// SceneLights - 基本ライト設定
export const SCENE_LIGHTS = {
  ambient: {
    intensity: 0.5,
    color: "#87CEEB",
  },
  point: {
    position: [10, 10, 10] as [number, number, number],
    intensity: 0.5,
    color: "#FFFFFF",
  },
  directional: {
    intensity: 8.0,
    color: "#FFD700",
    shadowMapSize: [1024, 1024] as [number, number],
    shadowCameraNear: 0.5,
    shadowCameraFar: 50,
    shadowCameraLeft: -20,
    shadowCameraRight: 20,
    shadowCameraTop: 20,
    shadowCameraBottom: -20,
  },
  spot: {
    position: [5, 8, 5] as [number, number, number],
    angle: 0.5,
    penumbra: 0.2,
    intensity: 1.0,
    color: "#FFFFFF",
  },
} as const;
