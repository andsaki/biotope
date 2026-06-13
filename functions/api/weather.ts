/**
 * Cloudflare Functions - 現在の天気API
 * Open-Meteoから東京の現在天気を取得する
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
}

interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
}

type WeatherCondition = "clear" | "cloudy" | "rain";

const TOKYO_STATION = {
  name: "東京",
  latitude: 35.6812,
  longitude: 139.7671,
} as const;

const CACHE_TTL_SECONDS = 30 * 60;

const WEATHER_LABELS: Record<WeatherCondition, string> = {
  clear: "晴",
  cloudy: "曇",
  rain: "雨",
};

const WEATHER_DESCRIPTIONS: Record<WeatherCondition, string> = {
  clear: "東京の空が明るい",
  cloudy: "東京の光がやわらぐ",
  rain: "東京に雨が降る",
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
    const apiUrl = new URL("https://api.open-meteo.com/v1/forecast");
    apiUrl.searchParams.set("latitude", String(TOKYO_STATION.latitude));
    apiUrl.searchParams.set("longitude", String(TOKYO_STATION.longitude));
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
      ].join(",")
    );
    apiUrl.searchParams.set("timezone", "Asia/Tokyo");
    apiUrl.searchParams.set("forecast_days", "1");

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

    return new Response(
      JSON.stringify({
        condition,
        label: WEATHER_LABELS[condition],
        description: WEATHER_DESCRIPTIONS[condition],
        observedAt: current.time,
        source: "open-meteo",
        location: TOKYO_STATION.name,
        weatherCode: current.weather_code,
        cloudCover: current.cloud_cover,
        precipitation:
          current.precipitation + current.rain + current.showers + current.snowfall,
        windDirection: current.wind_direction_10m,
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
