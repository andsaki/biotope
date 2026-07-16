import {
  DEFAULT_CLOUDY_THRESHOLD,
  DEFAULT_RAIN_THRESHOLD,
  RAINY_SEASON_CLOUDY_THRESHOLD,
  RAINY_SEASON_MONTH,
  RAINY_SEASON_RAIN_THRESHOLD,
  WEATHER_SCORE_BUCKETS,
  WEATHER_TIME_BLOCK_HOURS,
} from "@/constants/weather";

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers"
  | "snow"
  | "thunderstorm";

export type WeatherLocationSource = "browser" | "cloudflare" | "fallback";
export type WeatherTrend = "steady" | "clearing" | "worsening";

export interface WeatherForecastPoint {
  time: Date;
  condition: WeatherCondition;
  label: string;
  description: string;
  weatherCode: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  precipitationProbability: number | null;
  cloudCover: number;
  visibility: number;
  windDirection: number;
  windSpeed: number;
  windGusts: number;
  solarRadiation: number;
  isDay: boolean;
}

export interface WeatherSnapshot {
  condition: WeatherCondition;
  label: string;
  description: string;
  observedAt: Date;
  source: "open-meteo" | "fallback";
  location: string;
  locationSource: WeatherLocationSource;
  weatherCode: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  cloudCover: number;
  visibility: number;
  windDirection: number | null;
  windSpeed: number | null;
  windGusts: number | null;
  solarRadiation: number;
  isDay: boolean;
  sunrise: Date | null;
  sunset: Date | null;
  forecast: WeatherForecastPoint[];
  forecastSummary: string;
  trend: WeatherTrend;
}

interface WeatherApiResponse extends Omit<WeatherSnapshot, "observedAt" | "sunrise" | "sunset" | "forecast" | "forecastSummary" | "trend"> {
  observedAt: string;
  sunrise: string | null;
  sunset: string | null;
  forecast?: Array<Omit<WeatherForecastPoint, "time"> & { time: string }>;
}

export const weatherLabels: Record<WeatherCondition, string> = {
  clear: "晴",
  "partly-cloudy": "薄曇",
  cloudy: "曇",
  fog: "霧",
  drizzle: "霧雨",
  rain: "雨",
  showers: "にわか雨",
  snow: "雪",
  thunderstorm: "雷雨",
};

export const weatherDescriptions: Record<WeatherCondition, string> = {
  clear: "水面がよく光る",
  "partly-cloudy": "雲間から光が差す",
  cloudy: "光がやわらぐ",
  fog: "水辺に霧が漂う",
  drizzle: "細かな雨が水面を撫でる",
  rain: "雨粒が落ちる",
  showers: "雨脚が近づいては離れる",
  snow: "白い粒が静かに落ちる",
  thunderstorm: "遠くで空が鳴る",
};

const fallbackPrecipitation: Record<WeatherCondition, number> = {
  clear: 0,
  "partly-cloudy": 0,
  cloudy: 0,
  fog: 0,
  drizzle: 0.25,
  rain: 1.2,
  showers: 1.8,
  snow: 0.6,
  thunderstorm: 3.2,
};

const fallbackCloudCover: Record<WeatherCondition, number> = {
  clear: 18,
  "partly-cloudy": 42,
  cloudy: 68,
  fog: 88,
  drizzle: 82,
  rain: 92,
  showers: 78,
  snow: 90,
  thunderstorm: 96,
};

const conditionSeverity: Record<WeatherCondition, number> = {
  clear: 0,
  "partly-cloudy": 1,
  cloudy: 2,
  fog: 3,
  drizzle: 4,
  snow: 5,
  rain: 6,
  showers: 7,
  thunderstorm: 8,
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
    score: (year + month * 11 + day * 37 + timeBlock * 17) % WEATHER_SCORE_BUCKETS,
  };
};

const getFallbackCondition = (date: Date): WeatherCondition => {
  const { month, score } = getWeatherScore(date);
  const rainThreshold =
    month === RAINY_SEASON_MONTH ? RAINY_SEASON_RAIN_THRESHOLD : DEFAULT_RAIN_THRESHOLD;
  const cloudyThreshold =
    month === RAINY_SEASON_MONTH
      ? RAINY_SEASON_CLOUDY_THRESHOLD
      : DEFAULT_CLOUDY_THRESHOLD;

  return score < rainThreshold ? "rain" : score < cloudyThreshold ? "cloudy" : "clear";
};

const getTrend = (condition: WeatherCondition, forecast: WeatherForecastPoint[]): WeatherTrend => {
  const next = forecast.find((point) => point.time.getTime() > Date.now() + 20 * 60 * 1000);
  if (!next) return "steady";
  const difference = conditionSeverity[next.condition] - conditionSeverity[condition];
  if (difference >= 2) return "worsening";
  if (difference <= -2) return "clearing";
  return "steady";
};

export const createForecastSummary = (
  forecast: WeatherForecastPoint[],
  currentCondition: WeatherCondition = forecast[0]?.condition ?? "clear"
) => {
  const upcoming = forecast.slice(1, 4);
  if (upcoming.some((point) => point.condition === "thunderstorm")) return "遠くで雷の気配がする";
  if (upcoming.some((point) => point.condition === "snow")) return "このあと白い粒が近づく";
  if (upcoming.some((point) => ["rain", "showers", "drizzle"].includes(point.condition))) {
    return "このあと雨粒が近づく";
  }
  if (upcoming.some((point) => point.condition === "fog")) return "このあと霧が深くなる";
  if (conditionSeverity[currentCondition] >= 3 && upcoming.some((point) => point.condition === "clear")) {
    return "このあと光が戻る";
  }
  if (upcoming.some((point) => point.condition === "clear")) return "雲間から光が戻る";
  return "しばらく光はやわらかい";
};

const createFallbackForecast = (date: Date): WeatherForecastPoint[] =>
  Array.from({ length: 6 }, (_, index) => {
    const forecastDate = new Date(date.getTime() + index * 60 * 60 * 1000);
    const condition = getFallbackCondition(forecastDate);
    const precipitation = fallbackPrecipitation[condition];
    return {
      time: getJapanDate(forecastDate),
      condition,
      label: weatherLabels[condition],
      description: weatherDescriptions[condition],
      weatherCode: condition === "rain" ? 61 : condition === "cloudy" ? 3 : 0,
      temperature: 18,
      apparentTemperature: 18,
      humidity: condition === "rain" ? 88 : condition === "cloudy" ? 72 : 56,
      precipitation,
      rain: condition === "rain" ? precipitation : 0,
      snowfall: 0,
      precipitationProbability: condition === "rain" ? 72 : condition === "cloudy" ? 28 : 8,
      cloudCover: fallbackCloudCover[condition],
      visibility: condition === "rain" ? 9_000 : 20_000,
      windDirection: (forecastDate.getHours() * 35 + index * 23) % 360,
      windSpeed: condition === "rain" ? 4.8 : condition === "cloudy" ? 3.1 : 2.2,
      windGusts: condition === "rain" ? 7.2 : 4.2,
      solarRadiation: condition === "clear" ? 420 : condition === "cloudy" ? 140 : 50,
      isDay: forecastDate.getHours() >= 6 && forecastDate.getHours() < 18,
    };
  });

export const getFallbackWeather = (date = new Date()): WeatherSnapshot => {
  const condition = getFallbackCondition(date);
  const forecast = createFallbackForecast(date);
  const japanDate = getJapanDate(date);
  return {
    condition,
    label: weatherLabels[condition],
    description: weatherDescriptions[condition],
    observedAt: japanDate,
    source: "fallback",
    location: "水辺",
    locationSource: "fallback",
    weatherCode: forecast[0].weatherCode,
    temperature: forecast[0].temperature,
    apparentTemperature: forecast[0].apparentTemperature,
    humidity: forecast[0].humidity,
    precipitation: forecast[0].precipitation,
    rain: forecast[0].rain,
    snowfall: 0,
    cloudCover: fallbackCloudCover[condition],
    visibility: forecast[0].visibility,
    windDirection: null,
    windSpeed: null,
    windGusts: null,
    solarRadiation: forecast[0].solarRadiation,
    isDay: forecast[0].isDay,
    sunrise: null,
    sunset: null,
    forecast,
    forecastSummary: createForecastSummary(forecast, condition),
    trend: getTrend(condition, forecast),
  };
};

const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

const lerpDirection = (start: number, end: number, progress: number) => {
  const delta = ((end - start + 540) % 360) - 180;
  return (start + delta * progress + 360) % 360;
};

export const directWeatherSnapshot = (snapshot: WeatherSnapshot, now = new Date()): WeatherSnapshot => {
  if (snapshot.forecast.length < 2) return snapshot;
  const nowTime = now.getTime();
  let before = snapshot.forecast[0];
  let after = snapshot.forecast[1];

  for (let index = 0; index < snapshot.forecast.length - 1; index += 1) {
    const candidate = snapshot.forecast[index];
    const next = snapshot.forecast[index + 1];
    if (candidate.time.getTime() <= nowTime && next.time.getTime() >= nowTime) {
      before = candidate;
      after = next;
      break;
    }
  }

  const duration = Math.max(1, after.time.getTime() - before.time.getTime());
  const progress = Math.max(0, Math.min(1, (nowTime - before.time.getTime()) / duration));
  const conditionPoint = progress < 0.58 ? before : after;
  const directed: WeatherSnapshot = {
    ...snapshot,
    condition: conditionPoint.condition,
    label: conditionPoint.label,
    description: conditionPoint.description,
    weatherCode: conditionPoint.weatherCode,
    temperature: lerp(before.temperature, after.temperature, progress),
    apparentTemperature: lerp(before.apparentTemperature, after.apparentTemperature, progress),
    humidity: lerp(before.humidity, after.humidity, progress),
    precipitation: lerp(before.precipitation, after.precipitation, progress),
    rain: lerp(before.rain, after.rain, progress),
    snowfall: lerp(before.snowfall, after.snowfall, progress),
    cloudCover: lerp(before.cloudCover, after.cloudCover, progress),
    visibility: lerp(before.visibility, after.visibility, progress),
    windDirection: lerpDirection(before.windDirection, after.windDirection, progress),
    windSpeed: lerp(before.windSpeed, after.windSpeed, progress),
    windGusts: lerp(before.windGusts, after.windGusts, progress),
    solarRadiation: lerp(before.solarRadiation, after.solarRadiation, progress),
    isDay: conditionPoint.isDay,
  };
  directed.forecastSummary = createForecastSummary(snapshot.forecast, directed.condition);
  directed.trend = getTrend(directed.condition, snapshot.forecast);
  return directed;
};

interface FetchWeatherOptions {
  latitude?: number;
  longitude?: number;
}

export const fetchWeather = async (options: FetchWeatherOptions = {}): Promise<WeatherSnapshot | null> => {
  try {
    const url = new URL("/api/weather", window.location.origin);
    if (options.latitude !== undefined && options.longitude !== undefined) {
      url.searchParams.set("latitude", String(options.latitude));
      url.searchParams.set("longitude", String(options.longitude));
    }
    const response = await fetch(url);
    if (!response.ok) return null;
    if (!response.headers.get("content-type")?.includes("application/json")) return null;

    const data: WeatherApiResponse = await response.json();
    const forecast = (data.forecast ?? []).map((point) => ({ ...point, time: new Date(point.time) }));
    const snapshot: WeatherSnapshot = {
      ...data,
      observedAt: new Date(data.observedAt),
      sunrise: data.sunrise ? new Date(data.sunrise) : null,
      sunset: data.sunset ? new Date(data.sunset) : null,
      forecast,
      forecastSummary: createForecastSummary(forecast, data.condition),
      trend: getTrend(data.condition, forecast),
    };
    return directWeatherSnapshot(snapshot);
  } catch {
    return null;
  }
};

export const shouldShowRain = (weather: WeatherSnapshot) =>
  ["drizzle", "rain", "showers", "thunderstorm"].includes(weather.condition) && weather.rain > 0;

export const shouldShowSnow = (weather: WeatherSnapshot) =>
  weather.condition === "snow" || weather.snowfall > 0;

export const getRainIntensity = (weather: WeatherSnapshot) => {
  const current = Math.min(1, weather.rain / 4);
  const nearFuture = Math.max(0, ...weather.forecast.slice(0, 3).map((point) => Math.min(1, point.rain / 4)));
  return Math.max(current, nearFuture * 0.38);
};

export const getSnowIntensity = (weather: WeatherSnapshot) => Math.min(1, weather.snowfall / 2.5);

export const getCloudIntensity = (weather: WeatherSnapshot) =>
  Math.max(0, Math.min(1, weather.cloudCover / 100));

export const getFogIntensity = (weather: WeatherSnapshot) => {
  const visibilityFog = 1 - Math.min(1, weather.visibility / 16_000);
  const humidityFog = Math.max(0, (weather.humidity - 78) / 22);
  return Math.max(weather.condition === "fog" ? 0.72 : 0, visibilityFog * 0.8 + humidityFog * 0.2);
};

export const getGustIntensity = (weather: WeatherSnapshot) => {
  const speed = weather.windSpeed ?? 0;
  const gust = weather.windGusts ?? speed;
  return Math.max(0, Math.min(1, (gust - speed) / 8 + gust / 24));
};

export const getSolarIntensity = (weather: WeatherSnapshot) =>
  weather.isDay ? Math.max(0.08, Math.min(1, weather.solarRadiation / 650)) : 0;

export const getWaterReflectionIntensity = (weather: WeatherSnapshot) => {
  const cloudDimming = getCloudIntensity(weather) * 0.42;
  const rainDimming = getRainIntensity(weather) * 0.35;
  const fogDimming = getFogIntensity(weather) * 0.25;
  return Math.max(0.2, 0.55 + getSolarIntensity(weather) * 0.45 - cloudDimming - rainDimming - fogDimming);
};

export const getWeatherWaterTurbulence = (weather: WeatherSnapshot) =>
  1 + getRainIntensity(weather) * 0.65 + getCloudIntensity(weather) * 0.12 + getGustIntensity(weather) * 0.4;
