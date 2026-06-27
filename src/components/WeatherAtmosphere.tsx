import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThrottledFrame } from "@/hooks/useThrottledFrame";
import { getFogIntensity, type WeatherSnapshot } from "@/utils/weather";

interface WeatherAtmosphereProps {
  backgroundColor: string;
  isDay: boolean;
  weather: WeatherSnapshot;
}

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const WeatherAtmosphere = ({ backgroundColor, isDay, weather }: WeatherAtmosphereProps) => {
  const fog = useMemo(
    () => new THREE.Fog(backgroundColor, 10, isDay ? 60 : 40),
    [backgroundColor, isDay]
  );
  const lightningRef = useRef<THREE.PointLight>(null);
  const fogColorRef = useRef(new THREE.Color(backgroundColor));

  useEffect(() => {
    fogColorRef.current.set(backgroundColor);
  }, [backgroundColor]);

  useThrottledFrame((state, delta) => {
    const fogIntensity = getFogIntensity(weather);
    const targetNear = THREE.MathUtils.lerp(isDay ? 10 : 8, 2.8, fogIntensity);
    const targetFar = THREE.MathUtils.lerp(isDay ? 60 : 40, 13, fogIntensity);
    const blend = Math.min(1, delta * 0.8);
    fog.near = THREE.MathUtils.lerp(fog.near, targetNear, blend);
    fog.far = THREE.MathUtils.lerp(fog.far, targetFar, blend);
    fog.color.lerp(fogColorRef.current, blend);

    if (!lightningRef.current) return;
    const time = state.clock.getElapsedTime();
    const cycle = Math.floor(time / 7);
    const phase = time % 7;
    const hasFlash = weather.condition === "thunderstorm" && pseudoRandom(cycle + weather.weatherCode) > 0.68;
    const flash = hasFlash && phase < 0.22 ? Math.sin((phase / 0.22) * Math.PI) : 0;
    lightningRef.current.intensity = flash * 7;
  }, 20);

  return (
    <>
      <primitive object={fog} attach="fog" />
      <pointLight ref={lightningRef} position={[0, 18, -5]} color="#dce8ff" intensity={0} distance={80} />
    </>
  );
};

export default WeatherAtmosphere;
