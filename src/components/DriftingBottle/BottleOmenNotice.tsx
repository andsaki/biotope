import { Html } from "@react-three/drei";
import type { BottleOmen } from "@/utils/bottleJournal";

interface BottleOmenNoticeProps {
  isMobile: boolean;
  omen: BottleOmen;
}

export const BottleOmenNotice = ({ isMobile, omen }: BottleOmenNoticeProps) => (
  <Html fullscreen style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: isMobile ? "1rem" : "1.25rem",
        transform: "translateX(-50%)",
        width: isMobile ? "min(88vw, 340px)" : "360px",
        padding: isMobile ? "11px 14px" : "12px 16px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: "16px",
        background: "rgba(9, 18, 28, 0.66)",
        color: "rgba(255, 255, 255, 0.92)",
        boxShadow: "0 14px 32px rgba(0, 0, 0, 0.28)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        fontFamily: "'Noto Serif JP', serif",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
          fontSize: isMobile ? "12px" : "13px",
          letterSpacing: "0.08em",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: omen.color,
            boxShadow: `0 0 12px ${omen.color}`,
            flexShrink: 0,
          }}
        />
        水面へ帰った徴: {omen.label}
      </div>
      <div
        style={{
          fontSize: isMobile ? "11px" : "12px",
          lineHeight: 1.6,
          color: "rgba(255, 255, 255, 0.74)",
        }}
      >
        {omen.worldNote}
      </div>
    </div>
  </Html>
);
