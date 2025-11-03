import React, { useState, useEffect } from "react";
import { useSeason } from "../contexts/SeasonContext";
import SimulationClock from "./SimulationClock";
import "./UI.css";

/**
 * メインUIコンポーネント
 * 時計表示と季節選択パネルを提供
 */
const UI: React.FC = () => {
  const { season, setSeason } = useSeason();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSeasonPanelOpen, setIsSeasonPanelOpen] = useState(false);

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
    // モバイルでは選択後にパネルを閉じる
    if (isMobile) {
      setIsSeasonPanelOpen(false);
    }
  };

  const seasonIcons = {
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
  };

  return (
    <>
      {/* UIパネル全体 */}
      <div className={`ui-panel-wrapper ${isSeasonPanelOpen ? "open" : ""}`}>
        {/* 閉じるボタン */}
        <button
          className="ui-close-button"
          onClick={() => setIsSeasonPanelOpen(false)}
          aria-label="UIパネルを閉じる"
        >
          ✕
        </button>

        {/* 四季セレクタ */}
        <div className="season-selector">
          <h3 className="season-title">四季</h3>
          <div className="buttons">
            <button
              onClick={() => handleSeasonChange("spring")}
              className={`season-button ${season === "spring" ? "active" : ""}`}
            >
              {seasonIcons.spring}
            </button>
            <button
              onClick={() => handleSeasonChange("summer")}
              className={`season-button ${season === "summer" ? "active" : ""}`}
            >
              {seasonIcons.summer}
            </button>
            <button
              onClick={() => handleSeasonChange("autumn")}
              className={`season-button ${season === "autumn" ? "active" : ""}`}
            >
              {seasonIcons.autumn}
            </button>
            <button
              onClick={() => handleSeasonChange("winter")}
              className={`season-button ${season === "winter" ? "active" : ""}`}
            >
              {seasonIcons.winter}
            </button>
          </div>
        </div>

        {/* 時計 */}
        <div className={`clock-wrapper ${isMobile ? "mobile" : "desktop"}`}>
          <SimulationClock />
        </div>
      </div>

      {/* 開くボタン */}
      {!isSeasonPanelOpen && (
        <button
          className="ui-open-button"
          onClick={() => setIsSeasonPanelOpen(true)}
          aria-label="UIパネルを開く"
        >
          {seasonIcons[season]}
        </button>
      )}
    </>
  );
};

export default UI;