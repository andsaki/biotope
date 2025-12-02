export type RngFunction = () => number;

/**
 * 軽量な疑似乱数生成器（Mulberry32）
 * @param seed - 初期シード値
 */
export const createRng = (seed = 0x12345678): RngFunction => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomBetween = (rng: RngFunction, min: number, max: number) =>
  min + (max - min) * rng();
