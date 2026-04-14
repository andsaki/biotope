import { useCallback, useEffect, useRef, useState } from "react";
import { useDayPeriod, useSeason, type Season } from "@/contexts";

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

type AmbientSampleKey =
  | "spring-day"
  | "spring-night"
  | "summer-day"
  | "summer-night"
  | "autumn-day"
  | "autumn-night"
  | "winter-night";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

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
  const waterSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const seasonSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const seasonGainRef = useRef<GainNode | null>(null);
  const sampleBuffersRef = useRef<Partial<Record<AmbientSampleKey, AudioBuffer>>>({});

  // AudioContext 初期化
  useEffect(() => {
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
      }) as AudioContext;

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
      waterSourceRef.current = waterSource;
      seasonGainRef.current = seasonGain;
      setIsReady(true);

      return () => {
        waterSource.stop();
        seasonSourceRef.current?.stop();
        masterGain.disconnect();
        waterGain.disconnect();
        seasonGain.disconnect();
        void context.close();
      };
    } catch {
      setIsSupported(false);
    }
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
      const entries = Object.entries(AMBIENT_SAMPLE_URLS) as [AmbientSampleKey, string][];
      await Promise.all(
        entries.map(async ([key, url]) => {
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
            console.warn(`Ambient sample load failed: ${key}`, error);
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
    setIsMuted((prev) => !prev);
  }, []);

  const setVolume = useCallback((next: number) => {
    setVolumeState(clamp(next));
  }, []);

  return {
    isMuted,
    isSupported,
    isReady,
    volume,
    toggleMute,
    setMuted: setIsMuted,
    setVolume,
  };
};

const AMBIENT_SAMPLE_URLS: Record<AmbientSampleKey, string> = {
  "spring-day": "/audio/ambient/spring-birds-day.ogg",
  "spring-night": "/audio/ambient/spring-frogs-night.ogg",
  "summer-day": "/audio/ambient/summer-cicada-day.ogg",
  "summer-night": "/audio/ambient/summer-cricket-night.ogg",
  "autumn-day": "/audio/ambient/autumn-garden-day.ogg",
  "autumn-night": "/audio/ambient/suzumushi-night.ogg",
  "winter-night": "/audio/ambient/winter-snow-night.wav",
};

const AMBIENT_SAMPLE_GAIN_MULTIPLIERS: Record<AmbientSampleKey, number> = {
  "spring-day": 0.8,
  "spring-night": 0.7,
  "summer-day": 0.72,
  "summer-night": 0.68,
  "autumn-day": 0.52,
  "autumn-night": 0.62,
  "winter-night": 0.16,
};

const getAmbientSampleKey = (
  season: Season,
  isDay: boolean
): AmbientSampleKey | null => {
  if (season === "spring") {
    return isDay ? "spring-day" : "spring-night";
  }

  if (season === "summer") {
    return isDay ? "summer-day" : "summer-night";
  }

  if (season === "autumn") {
    return isDay ? "autumn-day" : "autumn-night";
  }

  if (season === "winter") {
    return isDay ? null : "winter-night";
  }

  return null;
};

const createWaterTexture = (context: AudioContext) => {
  const duration = 10;
  const frameCount = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  let last = 0;
  for (let i = 0; i < frameCount; i++) {
    const random = (Math.random() * 2 - 1) * 0.2;
    last = last * 0.95 + random * 0.05;
    data[i] = last * 0.6;
  }

  return buffer;
};

const createSeasonalTexture = (
  context: AudioContext,
  season: Season,
  isDay: boolean
) => {
  const duration = 6;
  const frames = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let i = 0; i < frames; i++) {
    const time = i / context.sampleRate;
    const base = Math.sin(2 * Math.PI * 0.12 * time) * 0.05;
    const layer = getSeasonalSample(season, isDay, time);
    channel[i] = base + layer;
  }

  return buffer;
};

const getSeasonalSample = (season: Season, isDay: boolean, time: number) => {
  const slowPulse = (Math.sin(2 * Math.PI * 0.05 * time) + 1) * 0.5;
  switch (season) {
    case "spring":
      return isDay
        ? chimeLayer(time) * 0.3 + breezeLayer(time) * 0.2
        : frogLayer(time) * 0.35 + nocturnalAir(time) * 0.15;
    case "summer":
      return isDay
        ? cicadaLayer(time) * 0.45 + shimmerLayer(time) * 0.15
        : cricketLayer(time) * 0.4 + waterDrops(time) * 0.08;
    case "autumn":
      return isDay
        ? dryLeavesLayer(time) * 0.35 + breezeLayer(time) * 0.15
        : bellCricketLayer(time) * 0.35 +
            cricketLayer(time) * 0.2 +
            windWhistle(time) * 0.15;
    case "winter":
    default:
      return isDay
        ? winterDayNoiseLayer(time) * 0.18 + slowPulse * 0.02
        : snowHushLayer(time) * 0.35 + slowPulse * 0.05;
  }
};

const breezeLayer = (time: number) => Math.sin(2 * Math.PI * 0.2 * time) * 0.5;

const chimeLayer = (time: number) =>
  Math.sin(2 * Math.PI * (1.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * time)) * time);

const frogLayer = (time: number) =>
  Math.sin(2 * Math.PI * 0.9 * time) * Math.sin(2 * Math.PI * 3 * time);

const cicadaLayer = (time: number) =>
  (() => {
    const gate = Math.max(Math.sin(2 * Math.PI * 7.5 * time), 0);
    const envelope = Math.pow(gate, 3) * 0.9;
    const carrier =
      Math.sin(2 * Math.PI * (4200 + 180 * Math.sin(2 * Math.PI * 0.8 * time)) * time) * 0.6 +
      Math.sin(2 * Math.PI * 6100 * time) * 0.25;
    return envelope * carrier;
  })();

const shimmerLayer = (time: number) =>
  Math.sin(2 * Math.PI * 1400 * time) * 0.08 +
  Math.sin(2 * Math.PI * 2200 * time) * 0.05;

const cricketLayer = (time: number) =>
  (() => {
    const gate = Math.max(Math.sin(2 * Math.PI * 2.4 * time), 0);
    const envelope = Math.pow(gate, 4) * 0.75;
    const chirp =
      Math.sin(2 * Math.PI * 3200 * time) * 0.5 +
      Math.sin(2 * Math.PI * 4700 * time) * 0.3;
    return envelope * chirp;
  })();

const bellCricketLayer = (time: number) => {
  const gate = Math.max(Math.sin(2 * Math.PI * 3.2 * time), 0);
  const envelope = Math.pow(gate, 2.8) * 0.8;
  const chirp =
    Math.sin(2 * Math.PI * 1200 * time) * 0.6 +
    Math.sin(2 * Math.PI * 1500 * time) * 0.4 +
    Math.sin(2 * Math.PI * 900 * time) * 0.3;
  return envelope * chirp;
};

const waterDrops = (time: number) =>
  Math.sin(2 * Math.PI * (0.3 + 0.1 * Math.sin(time)) * time);

const dryLeavesLayer = (time: number) =>
  Math.sin(2 * Math.PI * 1.5 * time) * 0.4 +
  Math.sin(2 * Math.PI * 0.7 * time) * 0.2;

const windWhistle = (time: number) =>
  Math.sin(2 * Math.PI * 0.18 * time) * 0.6 +
  Math.sin(2 * Math.PI * 0.07 * time) * 0.4;

const snowHushLayer = (time: number) =>
  Math.sin(2 * Math.PI * 0.05 * time) * 0.4 +
  Math.sin(2 * Math.PI * 0.02 * time) * 0.6;

const winterDayNoiseLayer = (time: number) =>
  smoothNoise(time, 1.8) * 0.8 + smoothNoise(time + 10, 4.5) * 0.25;

const nocturnalAir = (time: number) =>
  Math.sin(2 * Math.PI * 0.15 * time) * 0.4 +
  Math.sin(2 * Math.PI * 0.04 * time) * 0.3;

const smoothNoise = (time: number, rate: number) => {
  const scaledTime = time * rate;
  const lower = Math.floor(scaledTime);
  const upper = lower + 1;
  const blend = scaledTime - lower;
  const start = pseudoRandom(lower) * 2 - 1;
  const end = pseudoRandom(upper) * 2 - 1;
  return start + (end - start) * blend;
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1) * 43758.5453123;
  return value - Math.floor(value);
};
