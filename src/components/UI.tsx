import React, { useState, useEffect } from "react";
import { useSeason } from "../contexts/SeasonContext";
import SimulationClock from "./SimulationClock";
import "./UI.css";

interface UIProps {
  realTime?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  simulatedTime?: {
    minutes: number;
    seconds: number;
  };
  isDay: boolean;
}

const UI: React.FC<UIProps> = ({ realTime, simulatedTime, isDay }) => {
  const { season, setSeason } = useSeason();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSeasonChange = (
    newSeason: "spring" | "summer" | "autumn" | "winter"
  ) => {
    setSeason(newSeason);
  };

  return (
    <div className="ui-container">
      {isMobile && <SimulationClock realTime={realTime} simulatedTime={simulatedTime} isDay={isDay} />}
      <div className="season-selector">
        <h3 style={{ margin: 0, marginBottom: 10 }}>季節を選択</h3>
        <div className="buttons">
          <button
            onClick={() => handleSeasonChange("spring")}
            style={{
              backgroundColor: season === "spring" ? "#6CA080" : "#ccc",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: "1.1em",
            }}
          >
            春
          </button>
          <button
            onClick={() => handleSeasonChange("summer")}
            style={{
              backgroundColor: season === "summer" ? "#4C8C6A" : "#ccc",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: "1.1em",
            }}
          >
            夏
          </button>
          <button
            onClick={() => handleSeasonChange("autumn")}
            style={{
              backgroundColor: season === "autumn" ? "#5C7A6A" : "#ccc",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: "1.1em",
            }}
          >
            秋
          </button>
          <button
            onClick={() => handleSeasonChange("winter")}
            style={{
              backgroundColor: season === "winter" ? "#4A6A7A" : "#ccc",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: "1.1em",
            }}
          >
            冬
          </button>
        </div>
      </div>
      {!isMobile && <SimulationClock realTime={realTime} simulatedTime={simulatedTime} isDay={isDay} />}
    </div>
  );
};

export default UI;