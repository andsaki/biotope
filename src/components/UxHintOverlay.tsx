import { tokens } from "@/styles/tokens";

interface UxHintItem {
  done: boolean;
  label: string;
}

interface UxHintOverlayProps {
  guideItems: UxHintItem[];
  isMobile: boolean;
  showHints: boolean;
  showWaterHint: boolean;
  onDismissHints?: () => void;
  onReopenHints?: () => void;
}

export const UxHintOverlay = ({
  guideItems,
  isMobile,
  showHints,
  showWaterHint,
  onDismissHints,
  onReopenHints,
}: UxHintOverlayProps) => (
  <>
    {showHints && (
      <div
        style={{
          position: "fixed",
          left: isMobile ? "1rem" : "1.25rem",
          bottom: isMobile ? "1rem" : "1.25rem",
          zIndex: tokens.zIndex.modal,
          width: isMobile ? "min(88vw, 320px)" : "320px",
          padding: isMobile ? "14px" : "16px",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "18px",
          background:
            "linear-gradient(160deg, rgba(9, 18, 28, 0.72), rgba(18, 28, 42, 0.46))",
          color: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 16px 36px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
          }}
        >
          <div>
            <div
              style={{
                marginBottom: "4px",
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: 500,
                letterSpacing: "0.08em",
              }}
            >
              遊び方
            </div>
            <div
              style={{
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.72)",
              }}
            >
              気になる場所を少しずつ触ると、この水辺の表情がひらきます。
            </div>
          </div>

          <button
            onClick={onDismissHints}
            aria-label="操作ヒントを閉じる"
            style={{
              width: "2rem",
              height: "2rem",
              padding: 0,
              border: "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.06)",
              color: "rgba(255, 255, 255, 0.86)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: "10px",
          }}
        >
          {guideItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.spacing.sm,
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: 1.5,
                color: item.done
                  ? "rgba(255, 255, 255, 0.64)"
                  : "rgba(255, 255, 255, 0.92)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "15px" }}>
                {item.done ? "✓" : "○"}
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
          position: "fixed",
          left: isMobile ? "1rem" : "1.25rem",
          bottom: isMobile ? "1rem" : "1.25rem",
          zIndex: tokens.zIndex.ui,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.5rem",
          height: "2.5rem",
          padding: 0,
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: "999px",
          background: "rgba(9, 18, 28, 0.52)",
          color: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
          cursor: "pointer",
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
          position: "fixed",
          left: "50%",
          bottom: isMobile ? "1rem" : "1.25rem",
          transform: "translateX(-50%)",
          zIndex: tokens.zIndex.ui,
          padding: isMobile ? "8px 12px" : "10px 16px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          borderRadius: "999px",
          background: "rgba(9, 18, 28, 0.52)",
          color: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.24)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: isMobile ? "12px" : "13px",
          letterSpacing: "0.04em",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {isMobile
          ? "水面をタップすると波紋がひろがります"
          : "水面をクリックすると波紋がひろがります"}
      </div>
    )}
  </>
);
