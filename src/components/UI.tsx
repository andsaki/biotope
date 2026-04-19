import React, { useState } from "react";
import { useSeason } from "../contexts";
import SimulationClock from "./SimulationClock";
import { tokens } from "@/styles/tokens";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import type { HintProgress } from "@/hooks/useUxHints";

interface UIProps {
  showHints?: boolean;
  showUiHint?: boolean;
  showWaterHint?: boolean;
  hintProgress?: HintProgress;
  onDismissHints?: () => void;
  onReopenHints?: () => void;
  onPanelOpened?: () => void;
  onAmbientToggle?: () => void;
}

/**
 * メインUIコンポーネント
 * 時計表示と季節選択パネルを提供
 */
const UI: React.FC<UIProps> = ({
  showHints = false,
  showUiHint = false,
  showWaterHint = false,
  hintProgress,
  onDismissHints,
  onReopenHints,
  onPanelOpened,
  onAmbientToggle,
}) => {
  const { season, setSeason } = useSeason();
  const isMobile = useIsMobile();
  const [isSeasonPanelOpen, setIsSeasonPanelOpen] = useState(false);
  const ambientControls = useAmbientSound();

  const progress = hintProgress ?? {
    hasOpenedPanel: false,
    hasToggledAmbient: false,
    hasWaterRippled: false,
    hasBottleOpened: false,
  };

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

  const handleOpenPanel = () => {
    setIsSeasonPanelOpen(true);
    onPanelOpened?.();
  };

  const handleAmbientToggle = () => {
    ambientControls.toggleMute();
    onAmbientToggle?.();
  };

  const guideItems = [
    {
      done: progress.hasOpenedPanel,
      label: "右上から季節をひらく",
    },
    {
      done: progress.hasToggledAmbient,
      label: isMobile ? "環境音をタップで切り替える" : "環境音をクリックして切り替える",
    },
    {
      done: progress.hasBottleOpened,
      label: isMobile ? "漂流瓶をタップして便りを読む" : "漂流瓶をクリックして便りを読む",
    },
    {
      done: progress.hasWaterRippled,
      label: isMobile ? "水面をタップして波紋を見る" : "水面をクリックして波紋を見る",
    },
  ];

  const uiHintText = !progress.hasOpenedPanel
    ? isMobile
      ? "ここから季節と音をひらく"
      : "ここから季節と環境音をひらく"
    : isMobile
      ? "環境音はここで切り替え"
      : "環境音はこのパネルで切り替え";

  const showFloatingUiHint = showUiHint && !isSeasonPanelOpen;
  const showInlineAmbientHint =
    showUiHint && isSeasonPanelOpen && progress.hasOpenedPanel && !progress.hasToggledAmbient;

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
    justifyContent: isMobile ? 'center' : 'flex-start',
    gap: tokens.spacing.xs,
    fontFamily: tokens.typography.fontFamily.serif,
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 400,
    padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
    width: isMobile ? '100%' : 'auto',
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
              flexDirection: 'column',
              gap: tokens.spacing.sm,
              width: '100%',
              paddingRight: isMobile ? 0 : tokens.spacing.lg,
            }}
          >
            <h3
              style={{
                position: 'relative',
                margin: 0,
                marginBottom: 0,
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? '14px' : '20px',
                fontWeight: 300,
                color: 'rgba(255, 255, 255, 0.95)',
                textAlign: isMobile ? 'center' : 'left',
                letterSpacing: isMobile ? '4px' : '8px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              四季
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'center' : 'flex-end',
                flexDirection: 'column',
                alignItems: isMobile ? 'stretch' : 'flex-end',
                gap: tokens.spacing.xs,
              }}
            >
              <button
                onClick={handleAmbientToggle}
                disabled={!ambientControls.isSupported}
                aria-pressed={ambientControls.isMuted}
                style={{
                  ...getAmbientButtonStyle(ambientControls.isMuted),
                  width: isMobile ? '100%' : 'auto',
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

              {showInlineAmbientHint && (
                <div
                  style={{
                    alignSelf: isMobile ? 'stretch' : 'flex-end',
                    maxWidth: isMobile ? '100%' : '220px',
                    padding: isMobile ? '8px 10px' : '8px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '12px',
                    background: 'rgba(9, 18, 28, 0.42)',
                    color: 'rgba(255, 255, 255, 0.86)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    fontFamily: tokens.typography.fontFamily.serif,
                    fontSize: isMobile ? '11px' : '12px',
                    lineHeight: 1.5,
                    textAlign: isMobile ? 'center' : 'left',
                  }}
                >
                  {uiHintText}
                </div>
              )}
            </div>
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
          onClick={handleOpenPanel}
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

      {showFloatingUiHint && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '5.75rem' : '6.25rem',
            right: isMobile ? tokens.positioning.mobile.right : tokens.positioning.pc.right,
            zIndex: tokens.zIndex.modal,
            maxWidth: isMobile ? '180px' : '240px',
            padding: isMobile ? '8px 12px' : '10px 14px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '14px',
            background: 'rgba(9, 18, 28, 0.6)',
            color: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 14px 32px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: isMobile ? '12px' : '13px',
            lineHeight: 1.6,
            pointerEvents: 'none',
          }}
        >
          {uiHintText}
        </div>
      )}

      {showHints && (
        <div
          style={{
            position: 'fixed',
            left: isMobile ? '1rem' : '1.25rem',
            bottom: isMobile ? '1rem' : '1.25rem',
            zIndex: tokens.zIndex.modal,
            width: isMobile ? 'min(88vw, 320px)' : '320px',
            padding: isMobile ? '14px' : '16px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '18px',
            background: 'linear-gradient(160deg, rgba(9, 18, 28, 0.72), rgba(18, 28, 42, 0.46))',
            color: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: tokens.spacing.md,
              marginBottom: tokens.spacing.sm,
            }}
          >
            <div>
              <div
                style={{
                  marginBottom: '4px',
                  fontFamily: tokens.typography.fontFamily.serif,
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                }}
              >
                はじめての歩き方
              </div>
              <div
                style={{
                  fontSize: isMobile ? '12px' : '13px',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.72)',
                }}
              >
                気になる場所を少しずつ触ると、この水辺の表情がひらきます。
              </div>
            </div>

            <button
              onClick={onDismissHints}
              aria-label="操作ヒントを閉じる"
              style={{
                width: '2rem',
                height: '2rem',
                padding: 0,
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.86)',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '10px',
            }}
          >
            {guideItems.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.sm,
                  fontSize: isMobile ? '12px' : '13px',
                  lineHeight: 1.5,
                  color: item.done ? 'rgba(255, 255, 255, 0.64)' : 'rgba(255, 255, 255, 0.92)',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '15px' }}>
                  {item.done ? '✓' : '○'}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showHints && onReopenHints && (
        <button
          onClick={onReopenHints}
          aria-label="操作ヒントを再表示"
          style={{
            position: 'fixed',
            left: isMobile ? '1rem' : '1.25rem',
            bottom: isMobile ? '1rem' : '1.25rem',
            zIndex: tokens.zIndex.ui,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            padding: 0,
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '999px',
            background: 'rgba(9, 18, 28, 0.52)',
            color: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
            cursor: 'pointer',
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" opacity="0.35" />
            <path d="M9.7 9.2a2.65 2.65 0 0 1 5.12.92c0 1.88-1.9 2.55-2.6 3.48-.25.33-.34.62-.34 1.4" />
            <path d="M12 17.25h.01" />
          </svg>
        </button>
      )}

      {showWaterHint && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: isMobile ? '1rem' : '1.25rem',
            transform: 'translateX(-50%)',
            zIndex: tokens.zIndex.ui,
            padding: isMobile ? '8px 12px' : '10px 16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '999px',
            background: 'rgba(9, 18, 28, 0.52)',
            color: 'rgba(255, 255, 255, 0.92)',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.24)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: isMobile ? '12px' : '13px',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {isMobile ? '水面をタップすると波紋がひろがります' : '水面をクリックすると波紋がひろがります'}
        </div>
      )}
    </>
  );
};

export default UI;
