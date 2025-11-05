import React, { useState, useEffect } from "react";
import { useSeason } from "../contexts/SeasonContext";
import SimulationClock from "./SimulationClock";
import { tokens } from "@/styles/tokens";

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

  const getButtonStyle = (isActive: boolean) => ({
    fontFamily: tokens.typography.fontFamily.serif,
    fontSize: '16px',
    fontWeight: 500,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    border: `2px solid ${isActive ? tokens.colors.accent : tokens.colors.paperBorder}`,
    borderRadius: tokens.radius.sm,
    background: isActive ? tokens.colors.accent : 'rgba(255, 255, 255, 0.8)',
    color: isActive ? tokens.colors.paperBg : tokens.colors.textSecondary,
    cursor: 'pointer',
    transition: tokens.transitions.base,
  });

  return (
    <>
      {/* UIパネル全体 */}
      <div
        className={`ui-panel-wrapper ${isSeasonPanelOpen ? "open" : ""}`}
        style={{
          position: 'fixed',
          zIndex: tokens.zIndex.modal,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing.lg,
          padding: 0,
          opacity: isSeasonPanelOpen ? 1 : 0,
          pointerEvents: isSeasonPanelOpen ? 'all' : 'none',
          transition: tokens.transitions.base,
          top: isMobile ? tokens.positioning.mobile.top : tokens.positioning.pc.top,
          right: isMobile ? tokens.positioning.mobile.right : tokens.positioning.pc.right,
          ...(isMobile ? {
            maxWidth: '200px',
            transform: isSeasonPanelOpen ? 'translateX(0) scale(0.9)' : 'translateX(100%) scale(0.9)',
            transformOrigin: 'top right',
          } : {
            transform: isSeasonPanelOpen ? 'translateX(0)' : 'translateX(20px)',
          }),
        }}
      >
        {/* 四季セレクタ */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing.md,
            padding: isMobile ? tokens.spacing.lg : tokens.spacing.lg,
            border: `2px solid ${tokens.colors.paperBorder}`,
            borderRadius: tokens.radius.md,
            background: tokens.colors.paperBg,
            boxShadow: tokens.shadows.lg,
          }}
        >
          {/* 閉じるボタン */}
          <button
            onClick={() => setIsSeasonPanelOpen(false)}
            aria-label="UIパネルを閉じる"
            style={{
              position: 'absolute',
              top: tokens.spacing.md,
              right: tokens.spacing.md,
              zIndex: tokens.zIndex.dropdown,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              padding: 0,
              border: `2px solid ${tokens.colors.paperBorder}`,
              borderRadius: tokens.radius.sm,
              fontSize: '16px',
              fontWeight: 'bold',
              lineHeight: 1,
              color: tokens.colors.textPrimary,
              background: tokens.colors.paperBg,
              cursor: 'pointer',
              transition: tokens.transitions.fast,
              boxShadow: tokens.shadows.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = tokens.colors.paperBorder;
              e.currentTarget.style.color = tokens.colors.white;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = tokens.colors.paperBg;
              e.currentTarget.style.color = tokens.colors.textPrimary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
          {/* 装飾的なボーダー */}
          <div
            style={{
              position: 'absolute',
              top: tokens.spacing.sm,
              right: tokens.spacing.sm,
              bottom: tokens.spacing.sm,
              left: tokens.spacing.sm,
              border: `1px solid ${tokens.colors.paperBorder}`,
              borderRadius: tokens.radius.sm,
              pointerEvents: 'none',
            }}
          />

          <h3
            style={{
              position: 'relative',
              margin: 0,
              marginBottom: isMobile ? tokens.spacing.xs : 0,
              fontFamily: tokens.typography.fontFamily.serif,
              fontSize: isMobile ? '13px' : '18px',
              fontWeight: 500,
              color: tokens.colors.textPrimary,
              textAlign: 'center',
              letterSpacing: isMobile ? '2px' : '4px',
            }}
          >
            四季
          </h3>

          <div
            style={{
              position: 'relative',
              display: isMobile ? 'grid' : 'flex',
              ...(isMobile ? {
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: tokens.spacing.sm,
              } : {
                gap: tokens.spacing.lg,
              }),
            }}
          >
            <button
              onClick={() => handleSeasonChange("spring")}
              style={{
                ...getButtonStyle(season === "spring"),
                ...(isMobile && { fontSize: '15px' }),
              }}
            >
              {seasonIcons.spring}
            </button>
            <button
              onClick={() => handleSeasonChange("summer")}
              style={{
                ...getButtonStyle(season === "summer"),
                ...(isMobile && { fontSize: '15px' }),
              }}
            >
              {seasonIcons.summer}
            </button>
            <button
              onClick={() => handleSeasonChange("autumn")}
              style={{
                ...getButtonStyle(season === "autumn"),
                ...(isMobile && { fontSize: '15px' }),
              }}
            >
              {seasonIcons.autumn}
            </button>
            <button
              onClick={() => handleSeasonChange("winter")}
              style={{
                ...getButtonStyle(season === "winter"),
                ...(isMobile && { fontSize: '15px' }),
              }}
            >
              {seasonIcons.winter}
            </button>
          </div>
        </div>

        {/* 時計 */}
        <div style={{ position: 'relative' }}>
          <SimulationClock />
        </div>
      </div>

      {/* 開くボタン */}
      {!isSeasonPanelOpen && (
        <button
          onClick={() => setIsSeasonPanelOpen(true)}
          aria-label="UIパネルを開く"
          style={{
            position: 'fixed',
            top: isMobile ? tokens.positioning.mobile.top : tokens.positioning.pc.top,
            right: isMobile ? tokens.positioning.mobile.right : tokens.positioning.pc.right,
            zIndex: tokens.zIndex.ui,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? tokens.componentSizes.mobile.button : tokens.componentSizes.pc.button,
            height: isMobile ? tokens.componentSizes.mobile.button : tokens.componentSizes.pc.button,
            padding: 0,
            border: `2px solid ${tokens.colors.paperBorder}`,
            borderRadius: tokens.radius.md,
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: '20px',
            fontWeight: 600,
            color: tokens.colors.textPrimary,
            background: tokens.colors.paperBg,
            boxShadow: isMobile ? tokens.shadows.lg : tokens.shadows.md,
            cursor: 'pointer',
            transition: tokens.transitions.base,
          }}
        >
          {seasonIcons[season]}
        </button>
      )}
    </>
  );
};

export default UI;