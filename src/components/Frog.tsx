import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useModelScene } from "../hooks/useModelScene";
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
 * Get3DModelsの低ポリGLBを配置し、ランダム/クリックで鳴き声とジャンプを行う。
 */
const Frog: React.FC<FrogProps> = ({
  position,
  offset,
  scale,
  rotation,
  phaseOffset,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const frogScene = useModelScene("frog");
  const frogModel = useMemo(() => {
    const model = frogScene.clone(true);
    model.rotation.set(0, -Math.PI / 2, 0);
    return model;
  }, [frogScene]);
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
    const model = modelRef.current;

    const waterHeight =
      WATER_HEIGHT_BASE +
      Math.sin(time * WATER_HEIGHT_FREQUENCY) * WATER_HEIGHT_AMPLITUDE;
    const localWave =
      Math.sin(position[0] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
      Math.cos(position[2] * LILY_WAVE_FREQUENCY + time * LILY_WAVE_TIME_SCALE) *
      LILY_WAVE_AMPLITUDE;

    let jumpOffset = 0;
    let jumpProgress = 0;
    const jumpStart = jumpStartTimeRef.current;
    if (jumpStart !== null) {
      jumpProgress = (time - jumpStart) / FROG_JUMP_DURATION;
      if (jumpProgress >= 1) {
        jumpStartTimeRef.current = null;
        jumpProgress = 0;
      } else {
        jumpOffset = Math.sin(jumpProgress * Math.PI) * FROG_JUMP_HEIGHT;
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

    if (model) {
      const breathing = Math.sin(time * 2.2 + phaseOffset) * 0.018;
      const crouch =
        jumpProgress > 0 && jumpProgress < 0.18
          ? Math.sin((jumpProgress / 0.18) * Math.PI) * 0.1
          : 0;
      const landing =
        jumpProgress > 0.76
          ? Math.sin(((jumpProgress - 0.76) / 0.24) * Math.PI) * 0.08
          : 0;

      model.position.y = -crouch * 0.12;
      model.scale.set(
        1 + breathing + crouch * 0.12 - landing * 0.05,
        1 - crouch * 0.18 - landing * 0.1,
        1 + breathing + crouch * 0.12 - landing * 0.05
      );
      model.rotation.x = Math.sin(time * 0.9 + phaseOffset) * 0.025;
      model.rotation.y =
        -Math.PI / 2 +
        Math.sin(time * 0.7 + phaseOffset) * 0.06 +
        (jumpOffset > 0 ? Math.sin(jumpProgress * Math.PI) * 0.18 : 0);
      model.rotation.z = Math.sin(time * 1.1 + phaseOffset) * 0.018;
    }

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
      <primitive ref={modelRef} object={frogModel} />
    </group>
  );
};

export default React.memo(Frog);
