import { useEffect, useState } from "react";
import { WEATHER_REFRESH_INTERVAL_MS } from "@/constants/weather";
import { fetchWeather, getFallbackWeather } from "@/utils/weather";

/**
 * 現在の擬似天気を管理する。
 * 天気は日付と3時間帯から決定するため、リロードしても同じ時間帯は変わらない。
 */
export const useWeather = () => {
  const [weather, setWeather] = useState(() => getFallbackWeather());

  useEffect(() => {
    let disposed = false;

    const updateWeather = async () => {
      const nextWeather = await fetchWeather();
      if (!disposed) {
        setWeather(nextWeather ?? getFallbackWeather());
      }
    };

    updateWeather();

    const interval = setInterval(updateWeather, WEATHER_REFRESH_INTERVAL_MS);

    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, []);

  return weather;
};
