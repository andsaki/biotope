/**
 * 流星エフェクトの定数
 */

export const METEOR_CYCLE_SECONDS = 11;
export const METEOR_ACTIVE_SECONDS = 0.9;
export const METEOR_FIRST_DELAY_SECONDS = 1.7;

export const METEOR_TRAIL_LENGTH = 4.2;
export const METEOR_TRAIL_WIDTH = 0.16;
export const METEOR_GLOW_SIZE = 0.1;

export const METEOR_COLOR = "#fff6d6";
export const METEOR_MAX_OPACITY = 0.64;

export const METEOR_PATHS: ReadonlyArray<{
  start: [number, number, number];
  end: [number, number, number];
}> = [
  {
    start: [-7.5, 3.1, 2],
    end: [-7.5, 2.3, -3],
  },
  {
    start: [-7, 3.3, 1],
    end: [-7.8, 2.4, 4],
  },
  {
    start: [-8, 3, -3],
    end: [-7, 2.2, 2],
  },
];
