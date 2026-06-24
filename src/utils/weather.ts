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

export interface WeatherForecastPoint {
  time: Date;
  condition: WeatherCondition;
  label: string;
  description: string;
  precipitation: number;
  precipitationProbability: number | null;
  cloudCover: number;
  windDirection: number;
  windSpeed: number;
}

export interface WeatherSnapshot {
  condition: WeatherCondition;
  label: string;
  description: string;
  observedAt: Date;
  source: "open-meteo" | "fallback";
  location: string;
  precipitation: number;
  cloudCover: number;
  windDirection: number | null;
  windSpeed: number | null;
  forecast: WeatherForecastPoint[];
  forecastSummary: string;
}

interface WeatherApiResponse {
  condition: WeatherCondition;
  label: string;
  description: string;
  observedAt: string;
  source: "open-meteo";
  location: string;
  precipitation: number;
  cloudCover: number;
  windDirection: number;
  windSpeed: number;
  forecast?: Array<{
    time: string;
    condition: WeatherCondition;
    label: string;
    description: string;
    precipitation: number;
    precipitationProbability: number | null;
    cloudCover: number;
    windDirection: number;
    windSpeed: number;
  }>;
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

const fallbackPrecipitation: Record<WeatherCondition, number> = {
  clear: 0,
  cloudy: 0,
  rain: 1.2,
};

const fallbackCloudCover: Record<WeatherCondition, number> = {
  clear: 18,
  cloudy: 68,
  rain: 92,
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

const getFallbackCondition = (date: Date): WeatherCondition => {
  const { month, score } = getWeatherScore(date);
  const rainThreshold =
    month === RAINY_SEASON_MONTH
      ? RAINY_SEASON_RAIN_THRESHOLD
      : DEFAULT_RAIN_THRESHOLD;
  const cloudyThreshold =
    month === RAINY_SEASON_MONTH
      ? RAINY_SEASON_CLOUDY_THRESHOLD
      : DEFAULT_CLOUDY_THRESHOLD;

  return score < rainThreshold
    ? "rain"
    : score < cloudyThreshold
      ? "cloudy"
      : "clear";
};

const createForecastSummary = (forecast: WeatherForecastPoint[]) => {
  const upcoming = forecast.slice(1, 4);
  if (upcoming.some((point) => point.condition === "rain")) {
    return "このあと雨粒が近づく";
  }

  if (upcoming.some((point) => point.condition === "clear")) {
    return "このあと光が戻る";
  }

  return "しばらく光はやわらかい";
};

const createFallbackForecast = (date: Date): WeatherForecastPoint[] =>
  Array.from({ length: 6 }, (_, index) => {
    const forecastDate = new Date(date.getTime() + index * 60 * 60 * 1000);
    const condition = getFallbackCondition(forecastDate);

    return {
      time: getJapanDate(forecastDate),
      condition,
      label: weatherLabels[condition],
      description: weatherDescriptions[condition],
      precipitation: fallbackPrecipitation[condition],
      precipitationProbability: condition === "rain" ? 72 : condition === "cloudy" ? 28 : 8,
      cloudCover: fallbackCloudCover[condition],
      windDirection: (forecastDate.getHours() * 35 + index * 23) % 360,
      windSpeed: condition === "rain" ? 4.8 : condition === "cloudy" ? 3.1 : 2.2,
    };
  });

export const getFallbackWeather = (date = new Date()): WeatherSnapshot => {
  const condition = getFallbackCondition(date);
  const forecast = createFallbackForecast(date);

  return {
    condition,
    label: weatherLabels[condition],
    description: weatherDescriptions[condition],
    observedAt: getJapanDate(date),
    source: "fallback",
    location: "水辺",
    precipitation: fallbackPrecipitation[condition],
    cloudCover: fallbackCloudCover[condition],
    windDirection: null,
    windSpeed: null,
    forecast,
    forecastSummary: createForecastSummary(forecast),
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
    const forecast = (data.forecast ?? []).map((point) => ({
      ...point,
      time: new Date(point.time),
    }));

    return {
      condition: data.condition,
      label: data.label,
      description: data.description,
      observedAt: new Date(data.observedAt),
      source: data.source,
      location: data.location,
      precipitation: data.precipitation,
      cloudCover: data.cloudCover,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      forecast,
      forecastSummary: createForecastSummary(forecast),
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};

export const shouldShowRain = (weather: WeatherSnapshot) =>
  weather.condition === "rain";

export const getRainIntensity = (weather: WeatherSnapshot) => {
  const current = Math.min(1, weather.precipitation / 4);
  const nearFuture = Math.max(
    0,
    ...weather.forecast.slice(0, 3).map((point) => Math.min(1, point.precipitation / 4))
  );
  return Math.max(current, nearFuture * 0.45);
};

export const getCloudIntensity = (weather: WeatherSnapshot) =>
  Math.max(0, Math.min(1, weather.cloudCover / 100));

export const getWaterReflectionIntensity = (weather: WeatherSnapshot) => {
  const cloudDimming = getCloudIntensity(weather) * 0.45;
  const rainDimming = getRainIntensity(weather) * 0.35;
  return Math.max(0.25, 1 - cloudDimming - rainDimming);
};

export const getWeatherWaterTurbulence = (weather: WeatherSnapshot) =>
  1 + getRainIntensity(weather) * 0.65 + getCloudIntensity(weather) * 0.12;
