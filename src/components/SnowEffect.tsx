import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useThrottledFrame } from "@/hooks/useThrottledFrame";
import { createRng, randomBetween } from "@/utils/random";
import {
  SNOW_COUNT,
  SNOW_SPAWN_X_RANGE,
  SNOW_SPAWN_Y_RANGE,
  SNOW_SPAWN_Y_OFFSET,
  SNOW_SPAWN_Z_RANGE,
  SNOW_VELOCITY_X_DRIFT,
  SNOW_VELOCITY_Y_BASE,
  SNOW_VELOCITY_Y_RANGE,
  SNOW_VELOCITY_Z_DRIFT,
  SNOW_ANIMATION_SPEED,
  SNOW_WAVE_TIME_SCALE,
  SNOW_WAVE_AMPLITUDE,
  SNOW_WAVE_FREQUENCY_X,
  SNOW_WAVE_TIME_SCALE_Z,
  SNOW_WAVE_FREQUENCY_Z,
  SNOW_RESET_Y_THRESHOLD,
  SNOW_RESET_X_RANGE,
  SNOW_RESET_Y_BASE,
  SNOW_RESET_Y_RANGE,
  SNOW_RESET_Z_RANGE,
  SNOW_SIZE,
  SNOW_COLOR,
  SNOW_OPACITY,
  SNOW_ALPHA_TEST,
  SNOW_TEXTURE_SIZE,
  SNOW_TEXTURE_GRADIENT,
  SNOW_TEXTURE_GRADIENT_CENTER,
  SNOW_TEXTURE_GRADIENT_STOPS,
} from "../constants/snowEffect";

// 雪の結晶テクスチャ生成（一度だけ作成してメモ化）
const createSnowflakeTexture = (() => {
  let cachedTexture: THREE.Texture | null = null;
  return (): THREE.Texture => {
    if (cachedTexture) return cachedTexture;

    const canvas = document.createElement("canvas");
    canvas.width = SNOW_TEXTURE_SIZE;
    canvas.height = SNOW_TEXTURE_SIZE;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createRadialGradient(
        SNOW_TEXTURE_GRADIENT_CENTER.x,
        SNOW_TEXTURE_GRADIENT_CENTER.y,
        SNOW_TEXTURE_GRADIENT_CENTER.innerRadius,
        SNOW_TEXTURE_GRADIENT_CENTER.x,
        SNOW_TEXTURE_GRADIENT_CENTER.y,
        SNOW_TEXTURE_GRADIENT_CENTER.outerRadius
      );
      gradient.addColorStop(SNOW_TEXTURE_GRADIENT_STOPS.center, SNOW_TEXTURE_GRADIENT.centerColor);
      gradient.addColorStop(SNOW_TEXTURE_GRADIENT_STOPS.mid, SNOW_TEXTURE_GRADIENT.midColor);
      gradient.addColorStop(SNOW_TEXTURE_GRADIENT_STOPS.edge, SNOW_TEXTURE_GRADIENT.edgeColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, SNOW_TEXTURE_SIZE, SNOW_TEXTURE_SIZE);
    }

    cachedTexture = new THREE.CanvasTexture(canvas);
    return cachedTexture;
  };
})();

/**
 * 冬の雪エフェクト
 * 降り積もる雪をパーティクルシステムで表現
 */
interface SnowEffectProps {
  intensity?: number;
}

const SnowEffect: React.FC<SnowEffectProps> = React.memo(({ intensity = 1 }) => {
  const snowRef = useRef<THREE.Points>(null);
  const rngRef = useRef(createRng(0x5f0f1a7e));

  // 雪のパーティクル生成
  const snowParticles = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const velocities = new Float32Array(SNOW_COUNT * 3);
    const rng = rngRef.current;

    for (let i = 0; i < SNOW_COUNT; i++) {
      // 初期位置
      positions[i * 3] = randomBetween(rng, -SNOW_SPAWN_X_RANGE / 2, SNOW_SPAWN_X_RANGE / 2);
      positions[i * 3 + 1] = randomBetween(rng, SNOW_SPAWN_Y_OFFSET, SNOW_SPAWN_Y_OFFSET + SNOW_SPAWN_Y_RANGE);
      positions[i * 3 + 2] = randomBetween(rng, -SNOW_SPAWN_Z_RANGE / 2, SNOW_SPAWN_Z_RANGE / 2);

      // 落下速度
      velocities[i * 3] = randomBetween(rng, -SNOW_VELOCITY_X_DRIFT / 2, SNOW_VELOCITY_X_DRIFT / 2); // X方向のドリフト
      velocities[i * 3 + 1] = -randomBetween(rng, SNOW_VELOCITY_Y_BASE, SNOW_VELOCITY_Y_BASE + SNOW_VELOCITY_Y_RANGE); // Y方向（下向き）
      velocities[i * 3 + 2] = randomBetween(rng, -SNOW_VELOCITY_Z_DRIFT / 2, SNOW_VELOCITY_Z_DRIFT / 2); // Z方向のドリフト
    }

    return { positions, velocities };
  }, []);

  useThrottledFrame((state, delta) => {
    if (!snowRef.current) return;

    const positions = snowRef.current.geometry.attributes.position.array;
    if (!(positions instanceof Float32Array)) {
      return;
    }
    const scaledDelta = delta * SNOW_ANIMATION_SPEED;

    for (let i = 0; i < positions.length / 3; i++) {
      // 位置の更新
      positions[i * 3] += snowParticles.velocities[i * 3] * scaledDelta;
      positions[i * 3 + 1] += snowParticles.velocities[i * 3 + 1] * scaledDelta;
      positions[i * 3 + 2] += snowParticles.velocities[i * 3 + 2] * scaledDelta;

      // ふわふわとした動き（風の影響）
      positions[i * 3] +=
        Math.sin(state.clock.elapsedTime * SNOW_WAVE_TIME_SCALE + i * SNOW_WAVE_FREQUENCY_X) *
        SNOW_WAVE_AMPLITUDE *
        scaledDelta;
      positions[i * 3 + 2] +=
        Math.cos(state.clock.elapsedTime * SNOW_WAVE_TIME_SCALE_Z + i * SNOW_WAVE_FREQUENCY_Z) *
        SNOW_WAVE_AMPLITUDE *
        scaledDelta;

      // 地面に達したらリセット
      if (positions[i * 3 + 1] < SNOW_RESET_Y_THRESHOLD) {
        const rng = rngRef.current;
        positions[i * 3] = randomBetween(rng, -SNOW_RESET_X_RANGE / 2, SNOW_RESET_X_RANGE / 2);
        positions[i * 3 + 1] = randomBetween(rng, SNOW_RESET_Y_BASE, SNOW_RESET_Y_BASE + SNOW_RESET_Y_RANGE);
        positions[i * 3 + 2] = randomBetween(rng, -SNOW_RESET_Z_RANGE / 2, SNOW_RESET_Z_RANGE / 2);
      }
    }

    snowRef.current.geometry.attributes.position.needsUpdate = true;
  }, 30);

  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={snowParticles.positions.length / 3}
          array={snowParticles.positions}
          itemSize={3}
          args={[snowParticles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={SNOW_SIZE}
        color={SNOW_COLOR}
        transparent
        opacity={SNOW_OPACITY * (0.45 + intensity * 0.55)}
        sizeAttenuation
        map={createSnowflakeTexture()}
        alphaTest={SNOW_ALPHA_TEST}
      />
    </points>
  );
});

export default SnowEffect;
