import { useState, useEffect } from "react";
import { DAY_START_MINUTES, DAY_END_MINUTES } from "../constants";

export const useRealTime = () => {
  const [isDay, setIsDay] = useState(true);
  const [realTime, setRealTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // 初期化時に日本時間を取得
    const updateTime = () => {
      const now = new Date();
      // 日本時間 (UTC+9) に変換
      const japanTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
      );

      const hours = japanTime.getHours();
      const minutes = japanTime.getMinutes();
      const seconds = japanTime.getSeconds();

      setRealTime({ hours, minutes, seconds });

      // 分単位で昼夜判定 (6:00 - 18:00 が昼間)
      const totalMinutes = hours * 60 + minutes;
      setIsDay(
        totalMinutes >= DAY_START_MINUTES && totalMinutes < DAY_END_MINUTES
      );
    };

    // 初回実行
    updateTime();

    // 1秒ごとに更新
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isDay, realTime };
};
