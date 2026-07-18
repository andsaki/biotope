import type { Season } from "@/contexts";

export const createWaterTexture = (context: AudioContext) => {
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

export const createSeasonalTexture = (
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
