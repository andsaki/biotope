/**
 * Cloudflare Functions - 現在の天気API
 * Cloudflare のリクエスト位置情報を使って Open-Meteo から現在天気を取得する
 */

/// <reference types="@cloudflare/workers-types" />

interface OpenMeteoCurrent {
  time: string;
  weather_code: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloud_cover: number;
  wind_direction_10m: number;
  wind_speed_10m: number;
}

interface OpenMeteoHourly {
  time: string[];
  weather_code: number[];
  precipitation_probability?: number[];
  precipitation: number[];
  rain: number[];
  showers: number[];
  snowfall: number[];
  cloud_cover: number[];
  wind_direction_10m: number[];
  wind_speed_10m: number[];
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly?: OpenMeteoHourly;
}

type WeatherCondition = "clear" | "cloudy" | "rain";

interface RequestLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface CloudflareGeo {
  city?: unknown;
  region?: unknown;
  country?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

const CACHE_TTL_SECONDS = 30 * 60;
const FORECAST_HOURS = 6;

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  clear: "晴",
  cloudy: "曇",
  rain: "雨",
};

const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  clear: "近くの空が明るい",
  cloudy: "近くの光がやわらぐ",
  rain: "近くに雨が降る",
};

const rainyWeatherCodes = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
  95, 96, 99,
]);

const cloudyWeatherCodes = new Set([2, 3, 45, 48]);

const getCondition = (current: OpenMeteoCurrent): WeatherCondition => {
  const precipitation =
    current.precipitation + current.rain + current.showers + current.snowfall;

  if (precipitation > 0 || rainyWeatherCodes.has(current.weather_code)) {
    return "rain";
  }

  if (current.cloud_cover >= 55 || cloudyWeatherCodes.has(current.weather_code)) {
    return "cloudy";
  }

  return "clear";
};

const getHourlyCondition = ({
  weatherCode,
  precipitation,
  cloudCover,
}: {
  weatherCode: number;
  precipitation: number;
  cloudCover: number;
}): WeatherCondition => {
  if (precipitation > 0 || rainyWeatherCodes.has(weatherCode)) {
    return "rain";
  }

  if (cloudCover >= 55 || cloudyWeatherCodes.has(weatherCode)) {
    return "cloudy";
  }

  return "clear";
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
}) => precipitation + rain + showers + snowfall;

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
  const cf = request.cf as CloudflareGeo | undefined;
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
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "cloud_cover",
        "wind_direction_10m",
        "wind_speed_10m",
      ].join(",")
    );
    apiUrl.searchParams.set(
      "hourly",
      [
        "weather_code",
        "precipitation_probability",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "cloud_cover",
        "wind_direction_10m",
        "wind_speed_10m",
      ].join(",")
    );
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
    const condition = getCondition(current);
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
      const hourlyCondition = getHourlyCondition({
        weatherCode: hourly.weather_code[index] ?? 0,
        precipitation,
        cloudCover,
      });

      return {
        time,
        condition: hourlyCondition,
        label: WEATHER_LABELS[hourlyCondition],
        description: WEATHER_DESCRIPTIONS[hourlyCondition],
        precipitation,
        precipitationProbability: hourly.precipitation_probability?.[index] ?? null,
        cloudCover,
        windDirection: hourly.wind_direction_10m[index] ?? 0,
        windSpeed: hourly.wind_speed_10m[index] ?? 0,
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
        weatherCode: current.weather_code,
        cloudCover: current.cloud_cover,
        precipitation: currentPrecipitation,
        windDirection: current.wind_direction_10m,
        windSpeed: current.wind_speed_10m,
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
