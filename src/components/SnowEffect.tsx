import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useSeason } from "../contexts/SeasonContext";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
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
const SnowEffect: React.FC = React.memo(() => {
  const { season } = useSeason();
  const snowRef = useRef<THREE.Points>(null);

  // 雪のパーティクル生成
  const snowParticles = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const velocities = new Float32Array(SNOW_COUNT * 3);

    for (let i = 0; i < SNOW_COUNT; i++) {
      // 初期位置
      positions[i * 3] = (Math.random() - 0.5) * SNOW_SPAWN_X_RANGE;
      positions[i * 3 + 1] = Math.random() * SNOW_SPAWN_Y_RANGE + SNOW_SPAWN_Y_OFFSET;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SNOW_SPAWN_Z_RANGE;

      // 落下速度
      velocities[i * 3] = (Math.random() - 0.5) * SNOW_VELOCITY_X_DRIFT; // X方向のドリフト
      velocities[i * 3 + 1] = -(SNOW_VELOCITY_Y_BASE + Math.random() * SNOW_VELOCITY_Y_RANGE); // Y方向（下向き）
      velocities[i * 3 + 2] = (Math.random() - 0.5) * SNOW_VELOCITY_Z_DRIFT; // Z方向のドリフト
    }

    return { positions, velocities };
  }, []);

  useThrottledFrame((state, delta) => {
    if (!snowRef.current) return;

    const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
    const scaledDelta = delta * SNOW_ANIMATION_SPEED;

    for (let i = 0; i < positions.length / 3; i++) {
      // 位置の更新
      positions[i * 3] += snowParticles.velocities[i * 3] * scaledDelta;
      positions[i * 3 + 1] += snowParticles.velocities[i * 3 + 1] * scaledDelta;
      positions[i * 3 + 2] += snowParticles.velocities[i * 3 + 2] * scaledDelta;

      // ふわふわとした動き（風の影響）
      positions[i * 3] += Math.sin(state.clock.elapsedTime * SNOW_WAVE_TIME_SCALE + i * SNOW_WAVE_FREQUENCY_X) * SNOW_WAVE_AMPLITUDE;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime * SNOW_WAVE_TIME_SCALE_Z + i * SNOW_WAVE_FREQUENCY_Z) * SNOW_WAVE_AMPLITUDE;

      // 地面に達したらリセット
      if (positions[i * 3 + 1] < SNOW_RESET_Y_THRESHOLD) {
        positions[i * 3] = (Math.random() - 0.5) * SNOW_RESET_X_RANGE;
        positions[i * 3 + 1] = SNOW_RESET_Y_BASE + Math.random() * SNOW_RESET_Y_RANGE;
        positions[i * 3 + 2] = (Math.random() - 0.5) * SNOW_RESET_Z_RANGE;
      }
    }

    snowRef.current.geometry.attributes.position.needsUpdate = true;
  }, 30);

  if (season !== "winter") {
    return null;
  }

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
        opacity={SNOW_OPACITY}
        sizeAttenuation
        map={createSnowflakeTexture()}
        alphaTest={SNOW_ALPHA_TEST}
      />
    </points>
  );
});

export default SnowEffect;
