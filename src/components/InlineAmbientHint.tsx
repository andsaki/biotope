import { tokens } from "@/styles/tokens";

interface InlineAmbientHintProps {
  text: string;
  isMobile: boolean;
}

export const InlineAmbientHint = ({ text, isMobile }: InlineAmbientHintProps) => (
  <div
    style={{
      alignSelf: isMobile ? "stretch" : "flex-end",
      maxWidth: isMobile ? "100%" : "220px",
      padding: isMobile ? "8px 10px" : "8px 12px",
      border: "1px solid rgba(255, 255, 255, 0.16)",
      borderRadius: "12px",
      background: "rgba(9, 18, 28, 0.42)",
      color: "rgba(255, 255, 255, 0.86)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      fontFamily: tokens.typography.fontFamily.serif,
      fontSize: isMobile ? "11px" : "12px",
      lineHeight: 1.5,
      textAlign: isMobile ? "center" : "left",
    }}
  >
    {text}
  </div>
);
