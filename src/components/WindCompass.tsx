import { tokens } from "@/styles/tokens";

interface WindCompassProps {
  rotation: number;
  size: string;
}

export const WindCompass = ({ rotation, size }: WindCompassProps) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
    }}
  >
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        borderRadius: tokens.radius.full,
        background:
          "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: `
          inset 0 2px 4px rgba(255, 255, 255, 0.3),
          inset 0 -2px 4px rgba(0, 0, 0, 0.2),
          0 4px 12px rgba(0, 0, 0, 0.3)
        `,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "5px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "16px",
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.98)",
          textShadow:
            "0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 255, 255, 0.2)",
        }}
      >
        N
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "8px",
          transform: "translateY(-50%)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        E
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        S
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "8px",
          transform: "translateY(-50%)",
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: "14px",
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        W
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        width: "40px",
        height: "40px",
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
        transform: `rotate(${rotation}deg)`,
        transition: tokens.transitions.slow,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <defs>
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#FF6B6B", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#EE5A6F", stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M 20 5 L 25 20 L 20 17 L 15 20 Z"
          fill="url(#arrowGradient)"
          stroke="#fff"
          strokeWidth="1"
        />
      </svg>
    </div>

    <div
      style={{
        position: "absolute",
        zIndex: tokens.zIndex.dropdown,
        width: "10px",
        height: "10px",
        borderRadius: tokens.radius.full,
        background:
          "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5))",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow:
          "0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
      }}
    />
  </div>
);
