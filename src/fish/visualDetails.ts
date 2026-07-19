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
export const FISH_UNDERBODY_SHADOW_COLOR = "#07141d";
export const FISH_UNDERBODY_SHADOW_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];
export const NORMAL_FISH_UNDERBODY_SHADOW_POSITION: [number, number, number] = [0, -0.13, 0];
export const FLATFISH_UNDERBODY_SHADOW_POSITION: [number, number, number] = [0, -0.018, 0];

// 背側の受光ハイライト（水中影と対になるカウンターシェーディング）
export const FISH_DORSAL_SHEEN_COLOR = "#d8f0ff";
export const FISH_DORSAL_SHEEN_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];
export const NORMAL_FISH_DORSAL_SHEEN_POSITION: [number, number, number] = [0, 0.12, 0];
export const FLATFISH_DORSAL_SHEEN_POSITION: [number, number, number] = [0, 0.016, 0];

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
