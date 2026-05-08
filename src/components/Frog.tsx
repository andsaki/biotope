import React, { useCallback, useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  FROG_CROAK_AUDIO_URL,
  FROG_CROAK_CLIP_SECONDS,
  FROG_CROAK_VOLUME,
  FROG_JUMP_DURATION,
  FROG_JUMP_HEIGHT,
  FROG_RANDOM_ACTION_MIN_SECONDS,
  FROG_RANDOM_ACTION_VARIATION_SECONDS,
  LILY_WAVE_AMPLITUDE,
  LILY_WAVE_FREQUENCY,
  LILY_WAVE_TIME_SCALE,
  WATER_HEIGHT_AMPLITUDE,
  WATER_HEIGHT_BASE,
  WATER_HEIGHT_FREQUENCY,
} from "../constants/waterPlants";

interface FrogProps {
  position: [number, number, number];
  offset: [number, number, number];
  scale: number;
  rotation: number;
  phaseOffset: number;
}

const scheduleNextAction = () =>
  FROG_RANDOM_ACTION_MIN_SECONDS +
  Math.random() * FROG_RANDOM_ACTION_VARIATION_SECONDS;

const FrogModel = () => (
  // Proportions reference: Quaternius Frog (CC0) on Poly Pizza, adapted for the pond scale.
  <group rotation={[0, Math.PI / 2, 0]}>
    <mesh position={[0, 0.02, 0]} rotation={[0, 0, -0.1]} scale={[1.38, 0.58, 0.86]}>
      <sphereGeometry args={[0.34, 14, 10]} />
      <meshStandardMaterial
        color="#6da24a"
        emissive="#203f1b"
        emissiveIntensity={0.18}
        flatShading
        roughness={0.78}
      />
    </mesh>
    <mesh position={[0.29, 0.21, 0]} rotation={[0, 0, -0.16]} scale={[0.92, 0.58, 0.72]}>
      <sphereGeometry args={[0.31, 14, 10]} />
      <meshStandardMaterial
        color="#82b85a"
        emissive="#274b1d"
        emissiveIntensity={0.2}
        flatShading
        roughness={0.72}
      />
    </mesh>
    <mesh position={[0.32, 0.1, 0]} rotation={[0, 0, -0.1]} scale={[0.66, 0.3, 0.48]}>
      <sphereGeometry args={[0.23, 12, 8]} />
      <meshStandardMaterial
        color="#d7c77e"
        emissive="#3d3513"
        emissiveIntensity={0.08}
        flatShading
        roughness={0.84}
      />
    </mesh>

    <mesh position={[0.43, 0.38, -0.16]} scale={[0.58, 0.58, 0.58]}>
      <sphereGeometry args={[0.12, 12, 8]} />
      <meshStandardMaterial color="#a7d66e" emissive="#355a1f" emissiveIntensity={0.2} flatShading />
    </mesh>
    <mesh position={[0.43, 0.38, 0.16]} scale={[0.58, 0.58, 0.58]}>
      <sphereGeometry args={[0.12, 12, 8]} />
      <meshStandardMaterial color="#a7d66e" emissive="#355a1f" emissiveIntensity={0.2} flatShading />
    </mesh>
    <mesh position={[0.49, 0.41, -0.16]} scale={[0.5, 0.5, 0.5]}>
      <sphereGeometry args={[0.044, 10, 8]} />
      <meshStandardMaterial color="#f4eab8" roughness={0.46} />
    </mesh>
    <mesh position={[0.49, 0.41, 0.16]} scale={[0.5, 0.5, 0.5]}>
      <sphereGeometry args={[0.044, 10, 8]} />
      <meshStandardMaterial color="#f4eab8" roughness={0.46} />
    </mesh>
    <mesh position={[0.505, 0.418, -0.16]} scale={[0.5, 0.5, 0.5]}>
      <sphereGeometry args={[0.022, 8, 6]} />
      <meshStandardMaterial color="#111611" roughness={0.34} />
    </mesh>
    <mesh position={[0.505, 0.418, 0.16]} scale={[0.5, 0.5, 0.5]}>
      <sphereGeometry args={[0.022, 8, 6]} />
      <meshStandardMaterial color="#111611" roughness={0.34} />
    </mesh>

    <mesh position={[-0.18, -0.11, -0.3]} rotation={[0.06, -0.28, -0.2]} scale={[0.94, 0.18, 0.26]}>
      <sphereGeometry args={[0.28, 12, 8]} />
      <meshStandardMaterial color="#547f36" flatShading roughness={0.86} />
    </mesh>
    <mesh position={[-0.18, -0.11, 0.3]} rotation={[-0.06, 0.28, 0.2]} scale={[0.94, 0.18, 0.26]}>
      <sphereGeometry args={[0.28, 12, 8]} />
      <meshStandardMaterial color="#547f36" flatShading roughness={0.86} />
    </mesh>
    <mesh position={[-0.43, -0.15, -0.36]} rotation={[0, -0.58, -0.04]} scale={[0.5, 0.09, 0.16]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4b7131" flatShading roughness={0.88} />
    </mesh>
    <mesh position={[-0.43, -0.15, 0.36]} rotation={[0, 0.58, 0.04]} scale={[0.5, 0.09, 0.16]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4b7131" flatShading roughness={0.88} />
    </mesh>
    <mesh position={[0.26, -0.09, -0.24]} rotation={[0, -0.32, -0.22]} scale={[0.5, 0.08, 0.12]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#5b8a3a" flatShading roughness={0.86} />
    </mesh>
    <mesh position={[0.26, -0.09, 0.24]} rotation={[0, 0.32, 0.22]} scale={[0.5, 0.08, 0.12]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#5b8a3a" flatShading roughness={0.86} />
    </mesh>

    {[-0.18, 0.02, 0.18].map((z) => (
      <mesh key={`back-toe-left-${z}`} position={[-0.68, -0.17, -0.38 + z * 0.2]} rotation={[0, -0.7, 0]} scale={[0.14, 0.035, 0.035]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6d9c45" flatShading roughness={0.82} />
      </mesh>
    ))}
    {[-0.18, 0.02, 0.18].map((z) => (
      <mesh key={`back-toe-right-${z}`} position={[-0.68, -0.17, 0.38 - z * 0.2]} rotation={[0, 0.7, 0]} scale={[0.14, 0.035, 0.035]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6d9c45" flatShading roughness={0.82} />
      </mesh>
    ))}

    <mesh position={[0.16, 0.18, -0.26]} scale={[0.2, 0.08, 0.07]}>
      <sphereGeometry args={[0.12, 8, 6]} />
      <meshStandardMaterial color="#345326" flatShading roughness={0.88} />
    </mesh>
    <mesh position={[0.03, 0.09, 0.26]} scale={[0.16, 0.06, 0.06]}>
      <sphereGeometry args={[0.1, 8, 6]} />
      <meshStandardMaterial color="#345326" flatShading roughness={0.88} />
    </mesh>
    <mesh position={[-0.08, 0.17, 0.03]} scale={[0.18, 0.08, 0.07]}>
      <sphereGeometry args={[0.09, 8, 6]} />
      <meshStandardMaterial color="#315023" flatShading roughness={0.88} />
    </mesh>
  </group>
);

/**
 * 蓮の葉に乗る小さなカエル。
 * 低ポリのモデル風メッシュで表現し、ランダム/クリックで鳴き声とジャンプを行う。
 */
const Frog: React.FC<FrogProps> = ({
  position,
  offset,
  scale,
  rotation,
  phaseOffset,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAudioTimeoutRef = useRef<number | null>(null);
  const jumpStartTimeRef = useRef<number | null>(null);
  const nextActionAtRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef(0);

  const getAudioElement = useCallback(() => {
    if (typeof Audio === "undefined") return null;
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(FROG_CROAK_AUDIO_URL);
    audio.preload = "auto";
    audio.volume = FROG_CROAK_VOLUME;
    audioRef.current = audio;

    return audio;
  }, []);

  const playCroak = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;

    if (stopAudioTimeoutRef.current !== null) {
      window.clearTimeout(stopAudioTimeoutRef.current);
    }

    audio.pause();
    audio.volume = FROG_CROAK_VOLUME;
    if (Number.isFinite(audio.duration) && audio.duration > FROG_CROAK_CLIP_SECONDS) {
      audio.currentTime = Math.random() * (audio.duration - FROG_CROAK_CLIP_SECONDS);
    } else {
      audio.currentTime = 0;
    }

    void audio.play().catch(() => {
      // ブラウザの自動再生制限時はクリックまで無音にする。
    });

    stopAudioTimeoutRef.current = window.setTimeout(() => {
      audio.pause();
    }, FROG_CROAK_CLIP_SECONDS * 1000);
  }, [getAudioElement]);

  const triggerAction = useCallback(() => {
    jumpStartTimeRef.current = elapsedTimeRef.current;
    nextActionAtRef.current = elapsedTimeRef.current + scheduleNextAction();
    playCroak();
  }, [playCroak]);

  useEffect(() => {
    const audio = getAudioElement();

    audio?.load();

    return () => {
      if (stopAudioTimeoutRef.current !== null) {
        window.clearTimeout(stopAudioTimeoutRef.current);
      }
      audio?.pause();
    };
  }, [getAudioElement]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    elapsedTimeRef.current = time;
    nextActionAtRef.current ??= time + scheduleNextAction();

    const group = groupRef.current;
    if (!group) return;

    const waterHeight =
      WATER_HEIGHT_BASE +
      Math.sin(time * WATER_HEIGHT_FREQUENCY) * WATER_HEIGHT_AMPLITUDE;
    const localWave =
      Math.sin(position[0] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
      Math.cos(position[2] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
      LILY_WAVE_AMPLITUDE;

    let jumpOffset = 0;
    const jumpStart = jumpStartTimeRef.current;
    if (jumpStart !== null) {
      const progress = (time - jumpStart) / FROG_JUMP_DURATION;
      if (progress >= 1) {
        jumpStartTimeRef.current = null;
      } else {
        jumpOffset = Math.sin(progress * Math.PI) * FROG_JUMP_HEIGHT;
      }
    }

    group.position.set(
      position[0] + offset[0],
      waterHeight + localWave + offset[1] + jumpOffset,
      position[2] + offset[2]
    );
    group.rotation.set(
      jumpOffset > 0 ? Math.sin(time * 18 + phaseOffset) * 0.08 : 0,
      rotation + Math.sin(time * 1.2 + phaseOffset) * 0.06,
      jumpOffset > 0 ? Math.cos(time * 16 + phaseOffset) * 0.05 : 0
    );

    if (nextActionAtRef.current !== null && time > nextActionAtRef.current) {
      triggerAction();
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    triggerAction();
  };

  return (
    <group
      ref={groupRef}
      scale={[scale, scale, scale]}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <FrogModel />
    </group>
  );
};

export default React.memo(Frog);
