import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** アニメーション設定 */
interface AnimationConfig {
  /** 漂流アニメーションの所要時間（秒） */
  driftDuration: number;
  /** 漂流の開始位置 */
  startPosition: { x: number; z: number };
}

/** デフォルトのアニメーション設定 */
const DEFAULT_CONFIG: AnimationConfig = {
  driftDuration: 30,
  startPosition: { x: -15, z: 10 },
};

/**
 * 瓶の漂流アニメーションを管理するカスタムフック
 * @param targetPosition - 目標位置 [x, y, z]
 * @param config - アニメーション設定（オプション）
 * @returns 瓶のグループへの参照
 */
export const useBottleAnimation = (
  targetPosition: [number, number, number],
  config: Partial<AnimationConfig> = {}
) => {
  const bottleRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number | null>(null);

  const { driftDuration, startPosition } = { ...DEFAULT_CONFIG, ...config };

  useFrame((state) => {
    if (!bottleRef.current) return;

    const time = state.clock.elapsedTime;

    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    const elapsedTime = time - startTimeRef.current;
    const driftProgress = Math.min(elapsedTime / driftDuration, 1);
    const easeProgress = 1 - Math.pow(1 - driftProgress, 3);

    // 位置アニメーション
    const currentX =
      startPosition.x + (targetPosition[0] - startPosition.x) * easeProgress;
    const currentZ =
      startPosition.z + (targetPosition[2] - startPosition.z) * easeProgress;

    bottleRef.current.position.x =
      currentX + Math.sin(time * 0.5) * 0.5 * driftProgress;
    bottleRef.current.position.y =
      targetPosition[1] + Math.sin(time * 2) * 0.1;
    bottleRef.current.position.z =
      currentZ + Math.cos(time * 0.3) * 0.5 * driftProgress;

    // 回転アニメーション
    bottleRef.current.rotation.x = Math.sin(time * 0.5) * 0.4;
    bottleRef.current.rotation.z = Math.cos(time * 0.4) * 0.5;
    bottleRef.current.rotation.y = Math.sin(time * 0.3) * 0.3 + time * 0.05;
  });

  return bottleRef;
};
