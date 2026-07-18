import { useCallback, useEffect, useRef, useState } from "react";
import { useDayPeriod, useSeason } from "@/contexts";
import {
  AMBIENT_SAMPLE_GAIN_MULTIPLIERS,
  AMBIENT_SAMPLE_KEYS,
  AMBIENT_SAMPLE_URLS,
  getAmbientSampleKey,
  type AmbientSampleKey,
} from "./ambientSamples";
import { createSeasonalTexture, createWaterTexture } from "./ambientTextures";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

interface AmbientSoundControls {
  isMuted: boolean;
  isReady: boolean;
  isSupported: boolean;
  volume: number;
  toggleMute: () => void;
  setMuted: (next: boolean) => void;
  setVolume: (next: number) => void;
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const shouldLogAmbientSampleFailure = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("audioDebug") === "1";
};

/**
 * 季節と昼夜に応じた環境音を管理するカスタムフック
 * - Web Audio API を使用して軽量な環境音を生成
 * - 水音は常時再生し、季節レイヤーを重ねる
 * - ミュート状態と音量を公開
 */
export const useAmbientSound = (): AmbientSoundControls => {
  const { season } = useSeason();
  const isDay = useDayPeriod();

  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolumeState] = useState(0.6);
  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const waterGainRef = useRef<GainNode | null>(null);
  const waterSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const seasonSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const seasonGainRef = useRef<GainNode | null>(null);
  const sampleBuffersRef = useRef<Partial<Record<AmbientSampleKey, AudioBuffer>>>({});

  const initializeAudio = useCallback(() => {
    if (typeof window === "undefined" || audioContextRef.current) {
      return;
    }

    const AudioContextClass =
      window.AudioContext ?? window.webkitAudioContext ?? null;
    if (!AudioContextClass) {
      setIsSupported(false);
      return;
    }

    try {
      const context = new AudioContextClass({
        latencyHint: "playback",
      });

      const masterGain = context.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(context.destination);

      const waterGain = context.createGain();
      waterGain.gain.value = 0.4;
      waterGain.connect(masterGain);

      const waterSource = context.createBufferSource();
      waterSource.buffer = createWaterTexture(context);
      waterSource.loop = true;
      waterSource.start(0);
      waterSource.connect(waterGain);

      const seasonGain = context.createGain();
      seasonGain.gain.value = 0;
      seasonGain.connect(masterGain);

      audioContextRef.current = context;
      masterGainRef.current = masterGain;
      waterGainRef.current = waterGain;
      waterSourceRef.current = waterSource;
      seasonGainRef.current = seasonGain;
      setIsReady(true);
    } catch {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      waterSourceRef.current?.stop();
      seasonSourceRef.current?.stop();
      masterGainRef.current?.disconnect();
      waterGainRef.current?.disconnect();
      seasonGainRef.current?.disconnect();
      void audioContextRef.current?.close();
    };
  }, []);

  // 非生物系の実録サンプルを読み込む
  useEffect(() => {
    if (!isReady) {
      return;
    }
    const context = audioContextRef.current;
    if (!context || typeof window === "undefined") {
      return;
    }
    let cancelled = false;
    const loadSample = async () => {
      await Promise.all(
        AMBIENT_SAMPLE_KEYS.map(async (key) => {
          const url = AMBIENT_SAMPLE_URLS[key];
          if (sampleBuffersRef.current[key]) {
            return;
          }

          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ambient sample: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            if (cancelled) {
              return;
            }

            const decoded = await context.decodeAudioData(arrayBuffer);
            if (!cancelled) {
              sampleBuffersRef.current[key] = decoded;
            }
          } catch (error) {
            if (shouldLogAmbientSampleFailure()) {
              console.warn(`Ambient sample load failed: ${key}`, error);
            }
          }
        })
      );
    };
    void loadSample();

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  // 季節 & 昼夜に応じて実録音/環境レイヤーを差し替え
  useEffect(() => {
    const context = audioContextRef.current;
    const seasonGain = seasonGainRef.current;
    if (!context || !seasonGain || !isSupported) {
      return;
    }

    const newSource = context.createBufferSource();
    const sampleKey = getAmbientSampleKey(season, isDay);
    const sampleBuffer = sampleKey ? sampleBuffersRef.current[sampleKey] : null;
    const sampleGainMultiplier = sampleKey
      ? AMBIENT_SAMPLE_GAIN_MULTIPLIERS[sampleKey]
      : 1;
    if (sampleBuffer) {
      newSource.buffer = sampleBuffer;
      newSource.loop = true;
    } else {
      newSource.buffer = createSeasonalTexture(context, season, isDay);
      newSource.loop = true;
    }
    newSource.connect(seasonGain);
    newSource.start(0);

    const previous = seasonSourceRef.current;
    seasonSourceRef.current = newSource;

    const now = context.currentTime;
    seasonGain.gain.cancelScheduledValues(now);
    seasonGain.gain.setValueAtTime(0, now);
    const baseGain = isDay ? 0.45 : 0.32;
    const targetGain = baseGain * sampleGainMultiplier;
    seasonGain.gain.linearRampToValueAtTime(targetGain, now + 1.5);

    if (previous) {
      const stopAt = now + 0.2;
      try {
        previous.stop(stopAt);
      } catch {
        previous.stop();
      }
    }

    return () => {
      newSource.stop();
      newSource.disconnect();
    };
  }, [season, isDay, isSupported]);

  // ミュート/音量制御
  useEffect(() => {
    const context = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain || !isSupported) {
      return;
    }

    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    const targetVolume = isMuted ? 0 : clamp(volume, 0, 0.8);
    masterGain.gain.setTargetAtTime(targetVolume, now, 0.8);

    if (!isMuted && context.state === "suspended") {
      void context.resume();
    } else if (isMuted && context.state === "running") {
      void context.suspend();
    }
  }, [isMuted, volume, isSupported]);

  // クリック等のユーザー操作時に AudioContext を再開
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const attemptResume = () => {
      const context = audioContextRef.current;
      if (context && context.state === "suspended" && !isMuted) {
        void context.resume();
      }
    };

    window.addEventListener("pointerdown", attemptResume);
    window.addEventListener("keydown", attemptResume);

    return () => {
      window.removeEventListener("pointerdown", attemptResume);
      window.removeEventListener("keydown", attemptResume);
    };
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        initializeAudio();
      }
      return next;
    });
  }, [initializeAudio]);

  const setMuted = useCallback((next: boolean) => {
    if (!next) {
      initializeAudio();
    }
    setIsMuted(next);
  }, [initializeAudio]);

  const setVolume = useCallback((next: number) => {
    setVolumeState(clamp(next));
  }, []);

  return {
    isMuted,
    isSupported,
    isReady,
    volume,
    toggleMute,
    setMuted,
    setVolume,
  };
};
