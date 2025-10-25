import { memo } from "react";
import { Html } from "@react-three/drei";

/** メッセージカードのプロパティ */
interface MessageCardProps {
  /** メッセージ本文 */
  message: string;
  /** 送り主 */
  sender: string;
  /** 閉じるボタンのクリックハンドラ */
  onClose: (e: React.MouseEvent) => void;
}

/** カードのスタイル定義 */
const CARD_STYLES = {
  container: {
    background: "rgba(245, 230, 211, 0.98)",
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px",
    maxWidth: "400px",
    maxHeight: "500px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    fontFamily: "'Noto Serif JP', serif",
    position: "relative" as const,
    border: "2px solid #d4a574",
    overflow: "hidden" as const,
    display: "flex",
    flexDirection: "column" as const,
  },
  closeButton: {
    position: "absolute" as const,
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#8b7355",
  },
  title: {
    margin: "0 0 15px 0",
    color: "#5d4e37",
    fontSize: "18px",
    borderBottom: "1px solid #d4a574",
    paddingBottom: "10px",
    flexShrink: 0,
  },
  message: {
    margin: "0",
    lineHeight: "1.8",
    color: "#4a4a4a",
    fontSize: "14px",
    whiteSpace: "pre-wrap" as const,
  },
  sender: {
    marginTop: "15px",
    textAlign: "right" as const,
    fontSize: "12px",
    color: "#8b7355",
    fontStyle: "italic" as const,
  },
};

/**
 * 瓶の中のメッセージを表示するカード
 * @param props - コンポーネントのプロパティ
 */
export const MessageCard = memo(({ message, sender, onClose }: MessageCardProps) => {
  return (
    <Html center distanceFactor={10} style={{ pointerEvents: "all" }}>
      <div style={CARD_STYLES.container} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={CARD_STYLES.closeButton}>
          ×
        </button>
        <h3 style={CARD_STYLES.title}>海からの便り</h3>
        <div>
          <p style={CARD_STYLES.message}>{message}</p>
          <div style={CARD_STYLES.sender}>— {sender}</div>
        </div>
      </div>
    </Html>
  );
});

MessageCard.displayName = "MessageCard";
