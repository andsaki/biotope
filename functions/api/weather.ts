/**
 * Cloudflare Functions - 現在の天気API
 * Cloudflare のリクエスト位置情報を使って Open-Meteo から現在天気を取得する
 */

/// <reference types="@cloudflare/workers-types" />

interface OpenMeteoCurrent {
  time: string;
  weather_code: number;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloud_cover: number;
  visibility: number;
  wind_direction_10m: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  shortwave_radiation: number;
  is_day: number;
}

interface OpenMeteoHourly {
  time: string[];
  weather_code: number[];
  temperature_2m: number[];
  apparent_temperature: number[];
  relative_humidity_2m: number[];
  precipitation_probability?: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_direction_10m: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  shortwave_radiation: number[];
  is_day: number[];
}

interface OpenMeteoDaily {
  sunrise: string[];
  sunset: string[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly?: OpenMeteoHourly;
  daily?: OpenMeteoDaily;
}

type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers"
  | "snow"
  | "thunderstorm";

interface RequestLocation {
  name: string;
  latitude: number;
  longitude: number;
  source: "browser" | "cloudflare";
}

const CACHE_TTL_SECONDS = 30 * 60;
const FORECAST_HOURS = 6;

const WEATHER_LABELS: Record<WeatherCondition, string> = {
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

const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  clear: "近くの空が明るい",
  "partly-cloudy": "雲間から光が差す",
  cloudy: "近くの光がやわらぐ",
  fog: "水辺に霧が漂う",
  drizzle: "細かな雨が水面を撫でる",
  rain: "近くに雨が降る",
  showers: "雨脚が近づいては離れる",
  snow: "白い粒が静かに落ちる",
  thunderstorm: "遠くで空が鳴る",
};

const getCondition = (weatherCode: number, cloudCover: number): WeatherCondition => {
  if (weatherCode === 0) return "clear";
  if (weatherCode === 1) return "partly-cloudy";
  if (weatherCode === 2 || weatherCode === 3) return "cloudy";
  if (weatherCode === 45 || weatherCode === 48) return "fog";
  if (weatherCode >= 51 && weatherCode <= 57) return "drizzle";
  if (weatherCode >= 61 && weatherCode <= 67) return "rain";
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return "snow";
  }
  if (weatherCode >= 80 && weatherCode <= 82) return "showers";
  if (weatherCode >= 95) return "thunderstorm";
  return cloudCover >= 55 ? "cloudy" : "clear";
};

const sumPrecipitation = ({
  precipitation,
  rain,
  showers,
  snowfall,
}: {
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
}) => Math.max(precipitation, rain + showers + snowfall / 7);

const getStringValue = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const getNumberValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getRequestLocation = (request: Request): RequestLocation | null => {
  const url = new URL(request.url);
  const requestedLatitude = getNumberValue(url.searchParams.get("latitude"));
  const requestedLongitude = getNumberValue(url.searchParams.get("longitude"));
  if (
    requestedLatitude !== null &&
    requestedLongitude !== null &&
    requestedLatitude >= -90 &&
    requestedLatitude <= 90 &&
    requestedLongitude >= -180 &&
    requestedLongitude <= 180
  ) {
    return {
      name: "現在地",
      latitude: requestedLatitude,
      longitude: requestedLongitude,
      source: "browser",
    };
  }

  const cf = request.cf;
  const latitude = getNumberValue(cf?.latitude);
  const longitude = getNumberValue(cf?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  const city = getStringValue(cf?.city);
  const region = getStringValue(cf?.region);
  const country = getStringValue(cf?.country);
  const name = city ?? region ?? country ?? "現在地";

  return {
    name,
    latitude,
    longitude,
    source: "cloudflare",
  };
};

export const onRequest = async (context: EventContext<unknown, string, Record<string, unknown>>) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const location = getRequestLocation(context.request);
    if (!location) {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          "Cache-Control": "no-store",
        },
      });
    }

    const apiUrl = new URL("https://api.open-meteo.com/v1/forecast");
    apiUrl.searchParams.set("latitude", String(location.latitude));
    apiUrl.searchParams.set("longitude", String(location.longitude));
    apiUrl.searchParams.set(
      "current",
      [
        "weather_code",
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "cloud_cover",
        "visibility",
        "wind_direction_10m",
        "wind_speed_10m",
        "wind_gusts_10m",
        "shortwave_radiation",
        "is_day",
      ].join(",")
    );
    apiUrl.searchParams.set(
      "hourly",
      [
        "weather_code",
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "precipitation_probability",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "cloud_cover",
        "visibility",
        "wind_direction_10m",
        "wind_speed_10m",
        "wind_gusts_10m",
        "shortwave_radiation",
        "is_day",
      ].join(",")
    );
    apiUrl.searchParams.set("daily", "sunrise,sunset");
    apiUrl.searchParams.set("wind_speed_unit", "ms");
    apiUrl.searchParams.set("timezone", "auto");
    apiUrl.searchParams.set("forecast_days", "1");
    apiUrl.searchParams.set("forecast_hours", String(FORECAST_HOURS));

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
      cf: {
        cacheTtl: CACHE_TTL_SECONDS,
        cacheEverything: true,
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();
    const current = data.current;
    const condition = getCondition(current.weather_code, current.cloud_cover);
    const currentPrecipitation = sumPrecipitation({
      precipitation: current.precipitation,
      rain: current.rain,
      showers: current.showers,
      snowfall: current.snowfall,
    });
    const hourly = data.hourly;
    const forecast = hourly?.time.map((time, index) => {
      const precipitation = sumPrecipitation({
        precipitation: hourly.precipitation[index] ?? 0,
        rain: hourly.rain[index] ?? 0,
        showers: hourly.showers[index] ?? 0,
        snowfall: hourly.snowfall[index] ?? 0,
      });
      const cloudCover = hourly.cloud_cover[index] ?? 0;
      const rain = (hourly.rain[index] ?? 0) + (hourly.showers[index] ?? 0);
      const snowfall = hourly.snowfall[index] ?? 0;
      const hourlyCondition = getCondition(hourly.weather_code[index] ?? 0, cloudCover);

      return {
        time,
        condition: hourlyCondition,
        label: WEATHER_LABELS[hourlyCondition],
        description: WEATHER_DESCRIPTIONS[hourlyCondition],
        weatherCode: hourly.weather_code[index] ?? 0,
        temperature: hourly.temperature_2m[index] ?? 0,
        apparentTemperature: hourly.apparent_temperature[index] ?? 0,
        humidity: hourly.relative_humidity_2m[index] ?? 0,
        precipitation,
        rain,
        snowfall,
        precipitationProbability: hourly.precipitation_probability?.[index] ?? null,
        cloudCover,
        visibility: hourly.visibility[index] ?? 20_000,
        windDirection: hourly.wind_direction_10m[index] ?? 0,
        windSpeed: hourly.wind_speed_10m[index] ?? 0,
        windGusts: hourly.wind_gusts_10m[index] ?? 0,
        solarRadiation: hourly.shortwave_radiation[index] ?? 0,
        isDay: (hourly.is_day[index] ?? 0) === 1,
      };
    }) ?? [];

    return new Response(
      JSON.stringify({
        condition,
        label: WEATHER_LABELS[condition],
        description: WEATHER_DESCRIPTIONS[condition],
        observedAt: current.time,
        source: "open-meteo",
        location: location.name,
        locationSource: location.source,
        weatherCode: current.weather_code,
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        cloudCover: current.cloud_cover,
        visibility: current.visibility,
        precipitation: currentPrecipitation,
        rain: current.rain + current.showers,
        snowfall: current.snowfall,
        windDirection: current.wind_direction_10m,
        windSpeed: current.wind_speed_10m,
        windGusts: current.wind_gusts_10m,
        solarRadiation: current.shortwave_radiation,
        isDay: current.is_day === 1,
        sunrise: data.daily?.sunrise[0] ?? null,
        sunset: data.daily?.sunset[0] ?? null,
        forecast,
        cacheTtl: CACHE_TTL_SECONDS,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=0, s-maxage=${CACHE_TTL_SECONDS}`,
        },
      }
    );
  } catch (error) {
    console.error("Error fetching weather:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch weather",
      }),
      {
        status: 502,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }
};
