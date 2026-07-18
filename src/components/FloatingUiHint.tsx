import { tokens } from "@/styles/tokens";

interface FloatingUiHintProps {
  text: string;
  isMobile: boolean;
}

export const FloatingUiHint = ({ text, isMobile }: FloatingUiHintProps) => (
  <div
    style={{
      position: "fixed",
      top: isMobile ? "5.75rem" : "6.25rem",
      right: isMobile ? tokens.positioning.mobile.right : tokens.positioning.pc.right,
      zIndex: tokens.zIndex.modal,
      maxWidth: isMobile ? "180px" : "240px",
      padding: isMobile ? "8px 12px" : "10px 14px",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      borderRadius: "14px",
      background: "rgba(9, 18, 28, 0.6)",
      color: "rgba(255, 255, 255, 0.92)",
      boxShadow: "0 14px 32px rgba(0, 0, 0, 0.25)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      fontFamily: tokens.typography.fontFamily.serif,
      fontSize: isMobile ? "12px" : "13px",
      lineHeight: 1.6,
      pointerEvents: "none",
    }}
  >
    {text}
  </div>
);
