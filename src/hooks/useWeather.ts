import { useCallback, useEffect, useRef, useState } from "react";
import { WEATHER_REFRESH_INTERVAL_MS } from "@/constants/weather";
import {
  directWeatherSnapshot,
  fetchWeather,
  getFallbackWeather,
  type WeatherSnapshot,
} from "@/utils/weather";

export type WeatherLocationStatus = "approximate" | "requesting" | "precise" | "denied" | "unavailable";

interface StoredCoordinates {
  latitude: number;
  longitude: number;
}

const LOCATION_SESSION_KEY = "mizube_weather_coordinates";
const DIRECTOR_INTERVAL_MS = 10_000;

const loadStoredCoordinates = (): StoredCoordinates | null => {
  try {
    const raw = window.sessionStorage.getItem(LOCATION_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredCoordinates;
    return Number.isFinite(value.latitude) && Number.isFinite(value.longitude) ? value : null;
  } catch {
    return null;
  }
};

export const useWeather = () => {
  const [rawWeather, setRawWeather] = useState<WeatherSnapshot>(() => getFallbackWeather());
  const [weather, setWeather] = useState<WeatherSnapshot>(() => getFallbackWeather());
  const [locationStatus, setLocationStatus] = useState<WeatherLocationStatus>("approximate");
  const coordinatesRef = useRef<StoredCoordinates | null>(null);

  const updateWeather = useCallback(async (coordinates = coordinatesRef.current) => {
    const nextWeather = await fetchWeather(coordinates ?? {});
    const resolved = nextWeather ?? getFallbackWeather();
    setRawWeather(resolved);
    setWeather(directWeatherSnapshot(resolved));
    if (resolved.locationSource === "browser") setLocationStatus("precise");
  }, []);

  useEffect(() => {
    const stored = loadStoredCoordinates();
    coordinatesRef.current = stored;
    if (stored) setLocationStatus("precise");
    void updateWeather(stored);

    const refreshInterval = window.setInterval(() => void updateWeather(), WEATHER_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(refreshInterval);
  }, [updateWeather]);

  useEffect(() => {
    setWeather(directWeatherSnapshot(rawWeather));
    const directorInterval = window.setInterval(
      () => setWeather(directWeatherSnapshot(rawWeather)),
      DIRECTOR_INTERVAL_MS
    );
    return () => window.clearInterval(directorInterval);
  }, [rawWeather]);

  const requestPreciseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        coordinatesRef.current = coordinates;
        window.sessionStorage.setItem(LOCATION_SESSION_KEY, JSON.stringify(coordinates));
        setLocationStatus("precise");
        void updateWeather(coordinates);
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 30 * 60 * 1000 }
    );
  }, [updateWeather]);

  return { weather, locationStatus, requestPreciseLocation };
};
