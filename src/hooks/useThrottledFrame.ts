import { useRef } from "react";
import { useFrame, type RootState } from "@react-three/fiber";

/**
 * useFrame の呼び出し頻度を制御するヘルパー
 * @param callback - フレーム更新処理
 * @param fps - 1秒あたりの最大呼び出し回数
 */
export const useThrottledFrame = (
  callback: (state: RootState, delta: number) => void,
  fps = 30
) => {
  const accumulator = useRef(0);
  const step = 1 / fps;

  useFrame((state, delta) => {
    accumulator.current += delta;
    if (accumulator.current < step) {
      return;
    }
    callback(state, accumulator.current);
    accumulator.current = 0;
  });
};
