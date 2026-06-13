import {
  DEFAULT_CLOUDY_THRESHOLD,
  DEFAULT_RAIN_THRESHOLD,
  RAINY_SEASON_CLOUDY_THRESHOLD,
  RAINY_SEASON_MONTH,
  RAINY_SEASON_RAIN_THRESHOLD,
  WEATHER_SCORE_BUCKETS,
  WEATHER_TIME_BLOCK_HOURS,
} from "@/constants/weather";

export type WeatherCondition = "clear" | "cloudy" | "rain";

export interface WeatherSnapshot {
  condition: WeatherCondition;
  label: string;
  description: string;
  observedAt: Date;
  source: "open-meteo" | "fallback";
  location: string;
}

interface WeatherApiResponse {
  condition: WeatherCondition;
  label: string;
  description: string;
  observedAt: string;
  source: "open-meteo";
  location: string;
}

const weatherLabels: Record<WeatherCondition, string> = {
  clear: "晴",
  cloudy: "曇",
  rain: "雨",
};

const weatherDescriptions: Record<WeatherCondition, string> = {
  clear: "水面がよく光る",
  cloudy: "光がやわらぐ",
  rain: "雨粒が落ちる",
};

const getJapanDate = (date: Date) =>
  new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));

const getWeatherScore = (date: Date) => {
  const japanDate = getJapanDate(date);
  const year = japanDate.getFullYear();
  const month = japanDate.getMonth() + 1;
  const day = japanDate.getDate();
  const timeBlock = Math.floor(japanDate.getHours() / WEATHER_TIME_BLOCK_HOURS);

  return {
    month,
    score:
      (year + month * 11 + day * 37 + timeBlock * 17) %
      WEATHER_SCORE_BUCKETS,
  };
};

export const getFallbackWeather = (date = new Date()): WeatherSnapshot => {
  const { month, score } = getWeatherScore(date);
  const rainThreshold =
    month === RAINY_SEASON_MONTH
      ? RAINY_SEASON_RAIN_THRESHOLD
      : DEFAULT_RAIN_THRESHOLD;
  const cloudyThreshold =
    month === RAINY_SEASON_MONTH
      ? RAINY_SEASON_CLOUDY_THRESHOLD
      : DEFAULT_CLOUDY_THRESHOLD;

  const condition: WeatherCondition =
    score < rainThreshold
      ? "rain"
      : score < cloudyThreshold
        ? "cloudy"
        : "clear";

  return {
    condition,
    label: weatherLabels[condition],
    description: weatherDescriptions[condition],
    observedAt: getJapanDate(date),
    source: "fallback",
    location: "水辺",
  };
};

export const fetchWeather = async (): Promise<WeatherSnapshot | null> => {
  try {
    const response = await fetch("/api/weather");
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return null;
    }

    const data: WeatherApiResponse = await response.json();
    return {
      condition: data.condition,
      label: data.label,
      description: data.description,
      observedAt: new Date(data.observedAt),
      source: data.source,
      location: data.location,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};

export const shouldShowRain = (weather: WeatherSnapshot) =>
  weather.condition === "rain";
