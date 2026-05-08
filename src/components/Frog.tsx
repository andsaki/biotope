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

/**
 * 蓮の葉に乗る小さなカエル。
 * 軽量なプリミティブで表現し、ランダム/クリックで鳴き声とジャンプを行う。
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
      <mesh position={[0, -0.03, 0]} scale={[1.32, 0.74, 1.02]}>
        <sphereGeometry args={[0.32, 18, 12]} />
        <meshStandardMaterial color="#63a642" roughness={0.72} emissive="#1f3d16" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.2, 0.22, 0]} scale={[0.82, 0.66, 0.74]}>
        <sphereGeometry args={[0.28, 18, 12]} />
        <meshStandardMaterial color="#7bc85a" roughness={0.68} emissive="#244d19" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.18, 0.08, 0]} scale={[0.7, 0.42, 0.5]}>
        <sphereGeometry args={[0.18, 16, 10]} />
        <meshStandardMaterial color="#e2d486" roughness={0.82} emissive="#4d4314" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.35, 0.38, -0.15]} scale={[0.52, 0.52, 0.52]}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial color="#a3e36d" roughness={0.58} emissive="#315c1c" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.35, 0.38, 0.15]} scale={[0.52, 0.52, 0.52]}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial color="#a3e36d" roughness={0.58} emissive="#315c1c" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.41, 0.41, -0.15]} scale={[0.58, 0.58, 0.58]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#131813" roughness={0.4} />
      </mesh>
      <mesh position={[0.41, 0.41, 0.15]} scale={[0.58, 0.58, 0.58]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#131813" roughness={0.4} />
      </mesh>
      <mesh position={[-0.06, 0.05, -0.21]} scale={[0.45, 0.2, 0.35]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#2d5a22" roughness={0.85} />
      </mesh>
      <mesh position={[-0.08, 0.07, 0.18]} scale={[0.35, 0.16, 0.28]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#2d5a22" roughness={0.85} />
      </mesh>
      <mesh position={[0.08, 0.12, 0.24]} scale={[0.24, 0.12, 0.2]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#2d5a22" roughness={0.85} />
      </mesh>
      <mesh position={[-0.24, -0.12, -0.29]} rotation={[0.2, -0.45, -0.28]} scale={[0.92, 0.24, 0.32]}>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial color="#4f8d35" roughness={0.86} />
      </mesh>
      <mesh position={[-0.24, -0.12, 0.29]} rotation={[-0.2, 0.45, 0.28]} scale={[0.92, 0.24, 0.32]}>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial color="#4f8d35" roughness={0.86} />
      </mesh>
      <mesh position={[0.17, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 0.5, 0.14]}>
        <torusGeometry args={[0.17, 0.015, 6, 20, Math.PI]} />
        <meshStandardMaterial color="#29471f" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default React.memo(Frog);
