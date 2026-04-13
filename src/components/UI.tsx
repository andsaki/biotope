import React, { useState } from "react";
import { useSeason } from "../contexts";
import SimulationClock from "./SimulationClock";
import { tokens } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAmbientSound } from "@/hooks/useAmbientSound";

/**
 * メインUIコンポーネント
 * 時計表示と季節選択パネルを提供
 */
const UI: React.FC = () => {
  const { season, setSeason } = useSeason();
  const isMobile = useIsMobile();
  const [isSeasonPanelOpen, setIsSeasonPanelOpen] = useState(false);
  const ambientControls = useAmbientSound();

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
    fontWeight: isActive ? 500 : 400,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    border: isActive
      ? '1px solid rgba(255, 255, 255, 0.4)'
      : '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    background: isActive
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))'
      : 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isActive
      ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      : '0 2px 6px rgba(0, 0, 0, 0.2)',
    textShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
  });

  const getAmbientButtonStyle = (isMuted: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    fontFamily: tokens.typography.fontFamily.serif,
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 400,
    padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: 'rgba(255, 255, 255, 0.85)',
    background: isMuted
      ? 'rgba(255, 255, 255, 0.08)'
      : 'linear-gradient(120deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.12))',
    cursor: 'pointer',
    transition: tokens.transitions.base,
    boxShadow: isMuted
      ? '0 4px 12px rgba(0, 0, 0, 0.2)'
      : '0 6px 20px rgba(0, 0, 0, 0.35)',
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
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.2)
            `,
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
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              fontSize: '14px',
              fontWeight: '300',
              lineHeight: 1,
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            ✕
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              paddingRight: tokens.spacing.lg,
            }}
          >
            <h3
              style={{
                position: 'relative',
                margin: 0,
                marginBottom: isMobile ? tokens.spacing.xs : 0,
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? '14px' : '20px',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.95)',
                textAlign: 'left',
                letterSpacing: isMobile ? '4px' : '8px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              四季
            </h3>
            <button
              onClick={ambientControls.toggleMute}
              disabled={!ambientControls.isSupported}
              aria-pressed={ambientControls.isMuted}
              style={{
                ...getAmbientButtonStyle(ambientControls.isMuted),
                opacity: ambientControls.isSupported ? 1 : 0.6,
              }}
            >
              <span aria-hidden="true">
                {ambientControls.isMuted ? "🔇" : "🎧"}
              </span>
              {ambientControls.isSupported
                ? ambientControls.isMuted
                  ? "環境音 OFF"
                  : "環境音 ON"
                : "環境音 非対応"}
            </button>
          </div>

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
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: '22px',
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.95)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
            e.currentTarget.style.boxShadow = `
              0 12px 40px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `;
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.12))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = `
              0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `;
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))';
          }}
        >
          {seasonIcons[season]}
        </button>
      )}
    </>
  );
};

export default UI;
