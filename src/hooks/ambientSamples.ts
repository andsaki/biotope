import type { Season } from "@/contexts";

export type AmbientSampleKey =
  | "spring-day"
  | "spring-night"
  | "summer-day"
  | "summer-night"
  | "autumn-day"
  | "autumn-night"
  | "winter-night";

export const AMBIENT_SAMPLE_KEYS: AmbientSampleKey[] = [
  "spring-day",
  "spring-night",
  "summer-day",
  "summer-night",
  "autumn-day",
  "autumn-night",
  "winter-night",
];

export const AMBIENT_SAMPLE_URLS: Record<AmbientSampleKey, string> = {
  "spring-day": "/audio/ambient/spring-birds-day.ogg",
  "spring-night": "/audio/ambient/spring-frogs-night.ogg",
  "summer-day": "/audio/ambient/summer-cicada-day.ogg",
  "summer-night": "/audio/ambient/summer-cricket-night.ogg",
  "autumn-day": "/audio/ambient/autumn-garden-day.ogg",
  "autumn-night": "/audio/ambient/suzumushi-night.ogg",
  "winter-night": "/audio/ambient/winter-snow-night.wav",
};

export const AMBIENT_SAMPLE_GAIN_MULTIPLIERS: Record<AmbientSampleKey, number> = {
  "spring-day": 0.8,
  "spring-night": 0.7,
  "summer-day": 0.72,
  "summer-night": 0.68,
  "autumn-day": 0.52,
  "autumn-night": 0.62,
  "winter-night": 0.16,
};

export const getAmbientSampleKey = (
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
