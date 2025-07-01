import React from "react";
import { useSeason } from "../contexts/SeasonContext";

const UI: React.FC = () => {
  const { season, setSeason } = useSeason();

  const handleSeasonChange = (
    newSeason: "spring" | "summer" | "autumn" | "winter"
  ) => {
    setSeason(newSeason);
  };

  return (
    <div
      className="ui-container"
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(255, 255, 255, 0.8)",
        padding: 10,
        borderRadius: 5,
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 10 }}>季節を選択</h3>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => handleSeasonChange("spring")}
          style={{
            backgroundColor: season === "spring" ? "#6CA080" : "#ccc",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: 3,
            cursor: "pointer",
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
            padding: "8px 12px",
            borderRadius: 3,
            cursor: "pointer",
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
            padding: "8px 12px",
            borderRadius: 3,
            cursor: "pointer",
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
            padding: "8px 12px",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          冬
        </button>
      </div>
    </div>
  );
};

export default UI;
