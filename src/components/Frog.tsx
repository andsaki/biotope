import React, { useCallback, useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
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

const getAudioContextClass = () => {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ??
    null
  );
};

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
  const audioContextRef = useRef<AudioContext | null>(null);
  const jumpStartTimeRef = useRef<number | null>(null);
  const nextActionAtRef = useRef(scheduleNextAction());
  const elapsedTimeRef = useRef(0);

  const getAudioContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextClass = getAudioContextClass();
    if (!AudioContextClass) return null;

    audioContextRef.current = new AudioContextClass({
      latencyHint: "interactive",
    }) as AudioContext;
    return audioContextRef.current;
  }, []);

  const playCroak = useCallback(() => {
    const context = getAudioContext();
    if (!context) return;

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const gain = context.createGain();
    const lowOsc = context.createOscillator();
    const midOsc = context.createOscillator();
    const wobble = context.createOscillator();
    const wobbleGain = context.createGain();

    lowOsc.type = "sine";
    midOsc.type = "triangle";
    wobble.type = "sine";

    lowOsc.frequency.setValueAtTime(145, now);
    lowOsc.frequency.exponentialRampToValueAtTime(92, now + 0.28);
    midOsc.frequency.setValueAtTime(310, now);
    midOsc.frequency.exponentialRampToValueAtTime(190, now + 0.22);
    wobble.frequency.setValueAtTime(18, now);
    wobbleGain.gain.setValueAtTime(38, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(FROG_CROAK_VOLUME, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    wobble.connect(wobbleGain);
    wobbleGain.connect(lowOsc.frequency);
    lowOsc.connect(gain);
    midOsc.connect(gain);
    gain.connect(context.destination);

    lowOsc.start(now);
    midOsc.start(now);
    wobble.start(now);
    lowOsc.stop(now + 0.36);
    midOsc.stop(now + 0.32);
    wobble.stop(now + 0.36);

    window.setTimeout(() => {
      lowOsc.disconnect();
      midOsc.disconnect();
      wobble.disconnect();
      wobbleGain.disconnect();
      gain.disconnect();
    }, 420);
  }, [getAudioContext]);

  const triggerAction = useCallback(() => {
    jumpStartTimeRef.current = elapsedTimeRef.current;
    nextActionAtRef.current = elapsedTimeRef.current + scheduleNextAction();
    playCroak();
  }, [playCroak]);

  useEffect(() => {
    const unlockAudio = () => {
      const context = getAudioContext();
      if (context?.state === "suspended") {
        void context.resume();
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      void audioContextRef.current?.close();
    };
  }, [getAudioContext]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    elapsedTimeRef.current = time;

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

    if (time > nextActionAtRef.current) {
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
      <mesh position={[0, 0, 0]} scale={[1.25, 0.72, 0.95]}>
        <sphereGeometry args={[0.32, 18, 12]} />
        <meshStandardMaterial color="#5d8f3d" roughness={0.85} />
      </mesh>
      <mesh position={[0.18, 0.22, 0]} scale={[0.78, 0.62, 0.7]}>
        <sphereGeometry args={[0.28, 18, 12]} />
        <meshStandardMaterial color="#6fa64a" roughness={0.8} />
      </mesh>
      <mesh position={[0.34, 0.36, -0.13]} scale={[0.45, 0.45, 0.45]}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial color="#8fcf61" roughness={0.7} />
      </mesh>
      <mesh position={[0.34, 0.36, 0.13]} scale={[0.45, 0.45, 0.45]}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial color="#8fcf61" roughness={0.7} />
      </mesh>
      <mesh position={[0.39, 0.38, -0.13]} scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#131813" roughness={0.4} />
      </mesh>
      <mesh position={[0.39, 0.38, 0.13]} scale={[0.5, 0.5, 0.5]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color="#131813" roughness={0.4} />
      </mesh>
      <mesh position={[-0.22, -0.1, -0.26]} rotation={[0.2, -0.45, -0.28]} scale={[0.8, 0.22, 0.28]}>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial color="#4e7f33" roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, -0.1, 0.26]} rotation={[-0.2, 0.45, 0.28]} scale={[0.8, 0.22, 0.28]}>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshStandardMaterial color="#4e7f33" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.08, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.45, 0.45, 0.12]}>
        <torusGeometry args={[0.17, 0.015, 6, 20, Math.PI]} />
        <meshStandardMaterial color="#29471f" roughness={0.8} />
      </mesh>
    </group>
  );
};

export default React.memo(Frog);
