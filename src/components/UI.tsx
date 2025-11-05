import React, { useState, useEffect } from "react";
import { useSeason } from "../contexts/SeasonContext";
import SimulationClock from "./SimulationClock";
import tokens from "@/styles/tokens";
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
      <div
        className={`ui-panel-wrapper ${isSeasonPanelOpen ? "open" : ""}`}
        style={{
          gap: tokens.spacing.lg,
          zIndex: tokens.zIndex.modal,
        }}
      >
        {/* 閉じるボタン */}
        <button
          className="ui-close-button"
          onClick={() => setIsSeasonPanelOpen(false)}
          aria-label="UIパネルを閉じる"
          style={{
            borderRadius: tokens.radius.full,
            color: tokens.colors.textPrimary,
            transition: tokens.transitions.fast,
          }}
        >
          ✕
        </button>

        {/* 四季セレクタ */}
        <div
          className="season-selector"
          style={{
            padding: tokens.spacing.lg,
            borderRadius: tokens.radius.md,
            background: tokens.colors.paperBg,
            borderColor: tokens.colors.paperBorder,
            boxShadow: tokens.shadows.lg,
          }}
        >
          <h3
            className="season-title"
            style={{
              fontFamily: tokens.typography.fontFamily.serif,
              color: tokens.colors.textPrimary,
            }}
          >
            四季
          </h3>
          <div
            className="buttons"
            style={{
              gap: tokens.spacing.md,
            }}
          >
            <button
              onClick={() => handleSeasonChange("spring")}
              className={`season-button ${season === "spring" ? "active" : ""}`}
              style={{
                fontFamily: tokens.typography.fontFamily.serif,
                color: season === "spring" ? tokens.colors.paperBg : tokens.colors.textSecondary,
                background: season === "spring" ? tokens.colors.accent : "rgba(255, 255, 255, 0.8)",
                borderColor: season === "spring" ? tokens.colors.accent : tokens.colors.paperBorder,
                transition: tokens.transitions.base,
              }}
            >
              {seasonIcons.spring}
            </button>
            <button
              onClick={() => handleSeasonChange("summer")}
              className={`season-button ${season === "summer" ? "active" : ""}`}
              style={{
                fontFamily: tokens.typography.fontFamily.serif,
                color: season === "summer" ? tokens.colors.paperBg : tokens.colors.textSecondary,
                background: season === "summer" ? tokens.colors.accent : "rgba(255, 255, 255, 0.8)",
                borderColor: season === "summer" ? tokens.colors.accent : tokens.colors.paperBorder,
                transition: tokens.transitions.base,
              }}
            >
              {seasonIcons.summer}
            </button>
            <button
              onClick={() => handleSeasonChange("autumn")}
              className={`season-button ${season === "autumn" ? "active" : ""}`}
              style={{
                fontFamily: tokens.typography.fontFamily.serif,
                color: season === "autumn" ? tokens.colors.paperBg : tokens.colors.textSecondary,
                background: season === "autumn" ? tokens.colors.accent : "rgba(255, 255, 255, 0.8)",
                borderColor: season === "autumn" ? tokens.colors.accent : tokens.colors.paperBorder,
                transition: tokens.transitions.base,
              }}
            >
              {seasonIcons.autumn}
            </button>
            <button
              onClick={() => handleSeasonChange("winter")}
              className={`season-button ${season === "winter" ? "active" : ""}`}
              style={{
                fontFamily: tokens.typography.fontFamily.serif,
                color: season === "winter" ? tokens.colors.paperBg : tokens.colors.textSecondary,
                background: season === "winter" ? tokens.colors.accent : "rgba(255, 255, 255, 0.8)",
                borderColor: season === "winter" ? tokens.colors.accent : tokens.colors.paperBorder,
                transition: tokens.transitions.base,
              }}
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
          style={{
            fontFamily: tokens.typography.fontFamily.serif,
            color: tokens.colors.textPrimary,
            background: tokens.colors.paperBg,
            borderColor: tokens.colors.paperBorder,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadows.md,
            transition: tokens.transitions.base,
            zIndex: tokens.zIndex.ui,
          }}
        >
          {seasonIcons[season]}
        </button>
      )}
    </>
  );
};

export default UI;