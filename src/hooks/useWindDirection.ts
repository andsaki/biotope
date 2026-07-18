import { useState, useEffect } from "react";
import { WIND_CHANGE_INTERVAL } from "../constants/core";
import type { WindDirection } from "@/utils/bottleJournal";

const WIND_DIRECTION_SEQUENCE: WindDirection[] = ["East", "South", "West", "North"];

/**
 * 風向きを定期的に変更するカスタムフック
 * 一定間隔で風向きがゆるやかに巡る
 * @returns 現在の風向き
 */
export const useWindDirection = () => {
  const [windDirection, setWindDirection] = useState<WindDirection>("East");

  useEffect(() => {
    const changeWindDirection = () => {
      setWindDirection((currentDirection) => {
        const currentIndex = WIND_DIRECTION_SEQUENCE.indexOf(currentDirection);
        const nextIndex = (currentIndex + 1) % WIND_DIRECTION_SEQUENCE.length;
        return WIND_DIRECTION_SEQUENCE[nextIndex] ?? WIND_DIRECTION_SEQUENCE[0];
      });
    };

    const windInterval = setInterval(changeWindDirection, WIND_CHANGE_INTERVAL);
    return () => clearInterval(windInterval);
  }, []);

  return windDirection;
};
