import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useSeason } from "../contexts";
import { useThrottledFrame } from "../hooks/useThrottledFrame";
import { createRng, randomBetween } from "../utils/random";
import {
  PETAL_COUNT,
  PETAL_SPAWN_X_RANGE,
  PETAL_SPAWN_Y_BASE,
  PETAL_SPAWN_Y_RANGE,
  PETAL_SPAWN_Z_RANGE,
  PETAL_VELOCITY_X_DRIFT,
  PETAL_VELOCITY_Y_BASE,
  PETAL_VELOCITY_Y_RANGE,
  PETAL_VELOCITY_Z_DRIFT,
  PETAL_ANIMATION_SPEED,
  PETAL_WAVE_AMPLITUDE,
  PETAL_ROTATION_SPEED,
  PETAL_RESET_Y_THRESHOLD,
  PETAL_RESET_X_RANGE,
  PETAL_RESET_Y,
  PETAL_RESET_Z_RANGE,
  PETAL_SIZE,
  PETAL_COLOR,
  PETAL_OPACITY,
  PETAL_ALPHA_TEST,
  PETAL_TEXTURE_SIZE,
  PETAL_TEXTURE_GRADIENT,
  PETAL_TEXTURE_GRADIENT_CENTER,
  PETAL_TEXTURE_GRADIENT_STOPS,
} from "../constants/cherryBlossoms";

// 花びらのテクスチャ生成（一度だけ作成してメモ化）
const createPetalTexture = (() => {
  let cachedTexture: THREE.Texture | null = null;
  return (): THREE.Texture => {
    if (cachedTexture) return cachedTexture;

    const canvas = document.createElement("canvas");
    canvas.width = PETAL_TEXTURE_SIZE;
    canvas.height = PETAL_TEXTURE_SIZE;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createRadialGradient(
        PETAL_TEXTURE_GRADIENT_CENTER.x,
        PETAL_TEXTURE_GRADIENT_CENTER.y,
        PETAL_TEXTURE_GRADIENT_CENTER.innerRadius,
        PETAL_TEXTURE_GRADIENT_CENTER.x,
        PETAL_TEXTURE_GRADIENT_CENTER.y,
        PETAL_TEXTURE_GRADIENT_CENTER.outerRadius
      );
      gradient.addColorStop(PETAL_TEXTURE_GRADIENT_STOPS.center, PETAL_TEXTURE_GRADIENT.centerColor);
      gradient.addColorStop(PETAL_TEXTURE_GRADIENT_STOPS.mid, PETAL_TEXTURE_GRADIENT.midColor);
      gradient.addColorStop(PETAL_TEXTURE_GRADIENT_STOPS.edge, PETAL_TEXTURE_GRADIENT.edgeColor);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, PETAL_TEXTURE_SIZE, PETAL_TEXTURE_SIZE);
    }

    cachedTexture = new THREE.CanvasTexture(canvas);
    return cachedTexture;
  };
})();

/**
 * 春の桜の花びらエフェクト
 * 舞い落ちる桜の花びらをパーティクルシステムで表現
 */
const CherryBlossoms: React.FC = React.memo(() => {
  const { season } = useSeason();
  const particlesRef = useRef<THREE.Points>(null);
  const rngRef = useRef(createRng(0xc4e771a));

  // 花びらのパーティクル生成
  const particles = useMemo(() => {
    const positions = new Float32Array(PETAL_COUNT * 3);
    const velocities = new Float32Array(PETAL_COUNT * 3);
    const rotations = new Float32Array(PETAL_COUNT);
    const rng = rngRef.current;

    for (let i = 0; i < PETAL_COUNT; i++) {
      // 初期位置（上空からランダムに）
      positions[i * 3] = randomBetween(rng, -PETAL_SPAWN_X_RANGE / 2, PETAL_SPAWN_X_RANGE / 2);
      positions[i * 3 + 1] = randomBetween(rng, PETAL_SPAWN_Y_BASE, PETAL_SPAWN_Y_BASE + PETAL_SPAWN_Y_RANGE);
      positions[i * 3 + 2] = randomBetween(rng, -PETAL_SPAWN_Z_RANGE / 2, PETAL_SPAWN_Z_RANGE / 2);

      // 落下速度（ゆっくり）
      velocities[i * 3] = randomBetween(rng, -PETAL_VELOCITY_X_DRIFT / 2, PETAL_VELOCITY_X_DRIFT / 2); // X方向のドリフト
      velocities[i * 3 + 1] = PETAL_VELOCITY_Y_BASE - randomBetween(rng, 0, PETAL_VELOCITY_Y_RANGE); // Y方向（下向き）
      velocities[i * 3 + 2] = randomBetween(rng, -PETAL_VELOCITY_Z_DRIFT / 2, PETAL_VELOCITY_Z_DRIFT / 2); // Z方向のドリフト

      // 回転
      rotations[i] = randomBetween(rng, 0, Math.PI * 2);
    }

    return { positions, velocities, rotations };
  }, []);

  useThrottledFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array;
    if (!(positions instanceof Float32Array)) {
      return;
    }
    const scaledDelta = delta * PETAL_ANIMATION_SPEED;

    for (let i = 0; i < positions.length / 3; i++) {
      // 位置の更新
      positions[i * 3] += particles.velocities[i * 3] * scaledDelta;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * scaledDelta;
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * scaledDelta;

      // ふわふわとした動きを追加
      positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * PETAL_WAVE_AMPLITUDE;
      positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.5) * PETAL_WAVE_AMPLITUDE;

      // 地面に達したらリセット
      if (positions[i * 3 + 1] < PETAL_RESET_Y_THRESHOLD) {
        const rng = rngRef.current;
        positions[i * 3] = randomBetween(rng, -PETAL_RESET_X_RANGE / 2, PETAL_RESET_X_RANGE / 2);
        positions[i * 3 + 1] = PETAL_RESET_Y;
        positions[i * 3 + 2] = randomBetween(rng, -PETAL_RESET_Z_RANGE / 2, PETAL_RESET_Z_RANGE / 2);
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // 回転
    particlesRef.current.rotation.y = state.clock.elapsedTime * PETAL_ROTATION_SPEED;
  }, 30);

  if (season !== "spring") {
    return null;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PETAL_SIZE}
        color={PETAL_COLOR}
        transparent
        opacity={PETAL_OPACITY}
        sizeAttenuation
        map={createPetalTexture()}
        alphaTest={PETAL_ALPHA_TEST}
      />
    </points>
  );
});

export default CherryBlossoms;
