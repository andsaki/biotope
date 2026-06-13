import { useState, useEffect } from "react";
import { WIND_CHANGE_INTERVAL } from "../constants/core";
import type { WindDirection } from "@/utils/bottleJournal";

/**
 * 風向きを定期的に変更するカスタムフック
 * 一定間隔でランダムに風向きが変わる
 * @returns 現在の風向き
 */
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
