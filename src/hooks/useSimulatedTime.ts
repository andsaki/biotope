import { useState, useEffect } from "react";
import {
  SIMULATED_SECONDS_PER_REAL_SECOND,
  DAY_START_MINUTES,
  DAY_END_MINUTES,
  INITIAL_TIME_MINUTES,
} from "../constants";

export const useSimulatedTime = () => {
  const [isDay, setIsDay] = useState(true);
  const [simulatedTime, setSimulatedTime] = useState({
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 時刻を午後5時に設定
    setSimulatedTime({ minutes: INITIAL_TIME_MINUTES, seconds: 0 });
    setIsDay(true); // 午後5時は昼間

    // 24時間の1日が実時間の30分で経過するように時間進行を有効化
    const interval = setInterval(() => {
      setSimulatedTime((prev) => {
        const totalSeconds =
          (prev.minutes * 60 + prev.seconds + SIMULATED_SECONDS_PER_REAL_SECOND) % 86400;
        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        setIsDay(newMinutes >= DAY_START_MINUTES && newMinutes < DAY_END_MINUTES);
        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000); // 1秒ごとに更新

    return () => clearInterval(interval);
  }, []);

  return { isDay, simulatedTime };
};
