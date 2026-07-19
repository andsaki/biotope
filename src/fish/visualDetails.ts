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
// 天候で変わる瞳のキャッチライト不透明度（晴天ほど光を強く受ける）
export const FISH_EYE_HIGHLIGHT_OPACITY_MIN = 0.5;
export const FISH_EYE_HIGHLIGHT_OPACITY_MAX = 0.9;
export const FISH_UNDERBODY_SHADOW_COLOR = "#07141d";
export const FISH_UNDERBODY_SHADOW_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];
export const NORMAL_FISH_UNDERBODY_SHADOW_POSITION: [number, number, number] = [0, -0.13, 0];
export const FLATFISH_UNDERBODY_SHADOW_POSITION: [number, number, number] = [0, -0.018, 0];

// 天候で変わる水中影の不透明度（晴天は締まり、曇天は拡散して和らぐ）
export const FISH_UNDERBODY_SHADOW_OPACITY_MIN = 0.1;
export const FISH_UNDERBODY_SHADOW_OPACITY_MAX = 0.22;

// 背側の受光ハイライト（水中影と対になるカウンターシェーディング）
export const FISH_DORSAL_SHEEN_COLOR = "#d8f0ff";
export const FISH_DORSAL_SHEEN_ROTATION: [number, number, number] = [Math.PI / 2, 0, 0];
export const NORMAL_FISH_DORSAL_SHEEN_POSITION: [number, number, number] = [0, 0.12, 0];
export const FLATFISH_DORSAL_SHEEN_POSITION: [number, number, number] = [0, 0.016, 0];

// 天候で変わる受光ハイライトの不透明度（曇天/雨天は光が差さず弱まる）
export const FISH_DORSAL_SHEEN_OPACITY_MIN = 0.05;
export const FISH_DORSAL_SHEEN_OPACITY_MAX = 0.14;

/** 晴天ほど1に近づく水中の明るさ係数を返す */
export const getUnderwaterBrightness = (
  rainIntensity: number,
  cloudIntensity: number
) => Math.max(0, 1 - rainIntensity * 0.6 - cloudIntensity * 0.3);

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
