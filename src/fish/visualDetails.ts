import type { FishColorPattern } from "./types";

export const NORMAL_FISH_MARK_POSITION: [number, number, number] = [0.05, 0.08, 0];
export const NORMAL_FISH_MARK_ROTATION: [number, number, number] = [0, 0, Math.PI / 4];
export const FLATFISH_MARK_POSITION: [number, number, number] = [0.02, 0.015, 0];
export const FLATFISH_MARK_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];

export const NORMAL_FISH_EYE_POSITIONS: [number, number, number][] = [
  [0.18, 0.075, 0.045],
  [0.18, 0.075, -0.045],
];
export const FLATFISH_EYE_POSITIONS: [number, number, number][] = [
  [0.08, 0.042, 0.055],
  [0.08, 0.042, -0.055],
];

export const FISH_EYE_COLOR = "#08131b";
export const FISH_EYE_HIGHLIGHT_COLOR = "#dff7ff";

export const getFishAccentBaseOpacity = (
  isFlatfish: boolean,
  colorPattern: FishColorPattern
) => {
  if (isFlatfish) {
    return 0.42;
  }

  return colorPattern === "flash" ? 0.92 : 0.72;
};

export const getFishAccentBaseGlow = (
  isFlatfish: boolean,
  colorPattern: FishColorPattern
) => {
  if (isFlatfish) {
    return 0.08;
  }

  return colorPattern === "flash" ? 0.26 : 0.18;
};
