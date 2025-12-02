/**
 * 岩石の定数
 */

// 岩のデータ
export const ROCKS_DATA: ReadonlyArray<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
}> = [
  {
    position: [-2.5, -1, -2.5],
    rotation: [0, 0, 0],
    scale: [1.0, 0.8, 1.2],
    color: "#808080",
    roughness: 0.8,
    metalness: 0.1,
  },
  {
    position: [2.5, -1, -1.5],
    rotation: [0, Math.PI / 6, 0],
    scale: [0.7, 0.5, 0.9],
    color: "#696969",
    roughness: 0.9,
    metalness: 0.05,
  },
  {
    position: [-1.5, -1, 2.5],
    rotation: [0, Math.PI / 3, 0],
    scale: [1.2, 1.0, 1.4],
    color: "#A9A9A9",
    roughness: 0.7,
    metalness: 0.2,
  },
  {
    position: [3.5, -1, -3.5],
    rotation: [0, -Math.PI / 4, 0],
    scale: [0.9, 0.6, 1.1],
    color: "#778899",
    roughness: 0.85,
    metalness: 0.15,
  },
];

// ジオメトリ設定
export const ROCK_GEOMETRY = {
  radius: 1,
  detail: 0,
} as const;
