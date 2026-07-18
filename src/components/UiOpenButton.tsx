import { tokens } from "@/styles/tokens";
import type { Season } from "@/contexts";

interface UiOpenButtonProps {
  isMobile: boolean;
  season: Season;
  seasonIcons: Record<Season, string>;
  onOpen: () => void;
}

export const UiOpenButton = ({
  isMobile,
  season,
  seasonIcons,
  onOpen,
}: UiOpenButtonProps) => (
  <button
    onClick={onOpen}
    aria-label="UIパネルを開く"
    style={{
      position: "fixed",
      top: isMobile ? tokens.positioning.mobile.top : tokens.positioning.pc.top,
      right: isMobile ? tokens.positioning.mobile.right : tokens.positioning.pc.right,
      zIndex: tokens.zIndex.ui,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: isMobile ? tokens.componentSizes.mobile.button : tokens.componentSizes.pc.button,
      height: isMobile ? tokens.componentSizes.mobile.button : tokens.componentSizes.pc.button,
      padding: 0,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "16px",
      fontFamily: tokens.typography.fontFamily.serif,
      fontSize: "22px",
      fontWeight: 400,
      color: "rgba(255, 255, 255, 0.95)",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3)
      `,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "scale(1.05) translateY(-2px)";
      e.currentTarget.style.boxShadow = `
        0 12px 40px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `;
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.12))";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "scale(1) translateY(0)";
      e.currentTarget.style.boxShadow = `
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3)
      `;
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))";
    }}
  >
    {seasonIcons[season]}
  </button>
);
