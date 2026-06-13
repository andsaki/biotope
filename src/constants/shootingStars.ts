/**
 * 流星エフェクトの定数
 */

export const METEOR_CYCLE_SECONDS = 11;
export const METEOR_ACTIVE_SECONDS = 0.82;
export const METEOR_FIRST_DELAY_SECONDS = 9.4;

export const METEOR_TRAIL_LENGTH = 4.6;
export const METEOR_TRAIL_WIDTH = 0.18;
export const METEOR_GLOW_SIZE = 0.11;

export const METEOR_COLOR = "#fff6d6";
export const METEOR_MAX_OPACITY = 0.72;

export const METEOR_PATHS: ReadonlyArray<{
  start: [number, number, number];
  end: [number, number, number];
}> = [
  {
    start: [11.5, 13.4, -10],
    end: [-8, 11.4, 6],
  },
  {
    start: [7.5, 14.2, -12],
    end: [-10, 12.2, 3],
  },
  {
    start: [12, 12.8, -6],
    end: [-6, 10.8, 8],
  },
];
