import { useState, useEffect } from "react";
import { WIND_CHANGE_INTERVAL } from "../constants";

type WindDirection = "North" | "East" | "South" | "West";

export const useWindDirection = () => {
  const [windDirection, setWindDirection] = useState<WindDirection>("East");

  useEffect(() => {
    const directions: WindDirection[] = ["North", "East", "South", "West"];
    const changeWindDirection = () => {
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setWindDirection(randomDirection);
    };

    const windInterval = setInterval(changeWindDirection, WIND_CHANGE_INTERVAL);
    return () => clearInterval(windInterval);
  }, []);

  return windDirection;
};
