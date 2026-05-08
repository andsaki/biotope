import React, { useCallback, useEffect, useMemo, useRef } from "react";
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

type Vec3 = [number, number, number];

const scheduleNextAction = () =>
  FROG_RANDOM_ACTION_MIN_SECONDS +
  Math.random() * FROG_RANDOM_ACTION_VARIATION_SECONDS;

const createMaterial = (color: number, roughness = 0.82, emissive = 0x000000) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
    emissive,
    emissiveIntensity: 0.08,
  });

const createFacetedGeometry = (geometry: THREE.BufferGeometry) => {
  const facetedGeometry = geometry.toNonIndexed();
  facetedGeometry.computeVertexNormals();
  return facetedGeometry;
};

const createCuteFrogModel = () => {
  const root = new THREE.Group();
  const moss = createMaterial(0x6f9346, 0.86, 0x15250d);
  const lightMoss = createMaterial(0x93b860, 0.78, 0x1e3210);
  const belly = createMaterial(0xd8c980, 0.86);
  const eye = createMaterial(0xf0e6b5, 0.5);
  const pupil = createMaterial(0x0b0d09, 0.42);
  const cheek = createMaterial(0xcaa35f, 0.84);

  const addMesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: Vec3,
    scale: Vec3,
    rotation: Vec3 = [0, 0, 0]
  ) => {
    const mesh = new THREE.Mesh(createFacetedGeometry(geometry), material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rotation);
    root.add(mesh);
  };

  const sphere = (
    material: THREE.Material,
    position: Vec3,
    scale: Vec3,
    rotation: Vec3 = [0, 0, 0],
    widthSegments = 10,
    heightSegments = 7
  ) =>
    addMesh(
      new THREE.SphereGeometry(1, widthSegments, heightSegments),
      material,
      position,
      scale,
      rotation
    );

  const box = (
    material: THREE.Material,
    position: Vec3,
    scale: Vec3,
    rotation: Vec3 = [0, 0, 0]
  ) =>
    addMesh(
      new THREE.BoxGeometry(1, 1, 1),
      material,
      position,
      scale,
      rotation
    );

  sphere(moss, [-0.08, 0.03, 0], [0.48, 0.19, 0.34], [0, 0, -0.04], 12, 7);
  sphere(lightMoss, [0.34, 0.15, 0], [0.31, 0.2, 0.27], [0, 0, -0.12], 12, 7);
  sphere(belly, [0.33, 0.03, 0], [0.2, 0.07, 0.17], [0, 0, -0.08], 10, 6);

  sphere(lightMoss, [0.42, 0.3, -0.13], [0.09, 0.08, 0.08], [0, 0, -0.12], 8, 5);
  sphere(lightMoss, [0.42, 0.3, 0.13], [0.09, 0.08, 0.08], [0, 0, -0.12], 8, 5);
  sphere(eye, [0.46, 0.325, -0.13], [0.045, 0.035, 0.04], [0, 0, -0.12], 8, 5);
  sphere(eye, [0.46, 0.325, 0.13], [0.045, 0.035, 0.04], [0, 0, -0.12], 8, 5);
  sphere(pupil, [0.477, 0.333, -0.13], [0.018, 0.012, 0.018], [0, 0, -0.12], 6, 4);
  sphere(pupil, [0.477, 0.333, 0.13], [0.018, 0.012, 0.018], [0, 0, -0.12], 6, 4);

  sphere(moss, [-0.34, -0.08, -0.25], [0.2, 0.06, 0.11], [0.1, -0.45, -0.08], 8, 5);
  sphere(moss, [-0.34, -0.08, 0.25], [0.2, 0.06, 0.11], [-0.1, 0.45, 0.08], 8, 5);
  box(moss, [0.19, -0.1, -0.24], [0.23, 0.04, 0.055], [0.04, -0.32, -0.12]);
  box(moss, [0.19, -0.1, 0.24], [0.23, 0.04, 0.055], [-0.04, 0.32, 0.12]);
  sphere(cheek, [0.5, 0.17, -0.18], [0.025, 0.012, 0.025], [0, 0, -0.08], 6, 4);
  sphere(cheek, [0.5, 0.17, 0.18], [0.025, 0.012, 0.025], [0, 0, -0.08], 6, 4);

  root.rotation.y = -Math.PI / 2;
  return root;
};

/**
 * 蓮の葉に乗る小さなカエル。
 * 遠景でも気持ち悪く見えない、記号寄りの小さなモデルとして配置する。
 */
const Frog: React.FC<FrogProps> = ({
  position,
  offset,
  scale,
  rotation,
  phaseOffset,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const frogModel = useMemo(createCuteFrogModel, []);
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
      <primitive object={frogModel} />
    </group>
  );
};

export default React.memo(Frog);
