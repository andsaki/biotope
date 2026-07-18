import { tokens } from "@/styles/tokens";

interface UiPanelCloseButtonProps {
  onClose: () => void;
}

export const UiPanelCloseButton = ({ onClose }: UiPanelCloseButtonProps) => (
  <button
    onClick={onClose}
    aria-label="UIパネルを閉じる"
    style={{
      position: "absolute",
      top: tokens.spacing.md,
      right: tokens.spacing.md,
      zIndex: tokens.zIndex.dropdown,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2rem",
      height: "2rem",
      padding: 0,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "50%",
      fontSize: "14px",
      fontWeight: "300",
      lineHeight: 1,
      color: "rgba(255, 255, 255, 0.9)",
      background: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
      e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.4)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
      e.currentTarget.style.transform = "scale(1) rotate(0deg)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
    }}
  >
    ✕
  </button>
);
