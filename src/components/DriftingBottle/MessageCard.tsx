import { memo, type CSSProperties } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  formatJournalDate,
  getBottleDiscoveryLabel,
  type BottleOmen,
} from "@/utils/bottleJournal";

/** メッセージカードのプロパティ */
interface MessageCardProps {
  /** メッセージ本文 */
  message: string;
  /** 送り主 */
  sender: string;
  /** 表示中の便りの日付 */
  currentDate: string;
  /** 便りを閉じた後に水辺へ残る小さな効き目 */
  omen: BottleOmen;
  /** 閉じるボタンのクリックハンドラ */
  onClose: () => void;
}

type CardPointerEvent =
  | React.MouseEvent<HTMLElement>
  | React.PointerEvent<HTMLElement>;

const stopCardEvent = (event: CardPointerEvent) => {
  event.preventDefault();
  event.stopPropagation();
  event.nativeEvent.stopImmediatePropagation();
};

/** カードのスタイル定義 */
const CARD_STYLES: Record<string, CSSProperties> = {
  container: {
    background:
      "linear-gradient(150deg, rgba(252, 239, 220, 0.98), rgba(238, 216, 186, 0.98))",
    padding: "18px 20px 20px",
    borderRadius: "8px",
    width: "330px",
    maxWidth: "calc(100vw - 32px)",
    maxHeight: "min(74vh, 560px)",
    boxSizing: "border-box",
    boxShadow:
      "0 18px 42px rgba(20, 12, 4, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
    fontFamily: "'Noto Serif JP', serif",
    position: "relative",
    border: "2px solid #d4a574",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    color: "#4f422f",
    userSelect: "none",
  },
  content: {
    overflowY: "auto",
    paddingRight: "4px",
    overscrollBehavior: "contain",
  },
  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "transparent",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#8b7355",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
    lineHeight: "1",
    zIndex: 2,
    pointerEvents: "auto",
    touchAction: "manipulation",
  },
  title: {
    margin: "0",
    color: "#5d4e37",
    fontSize: "20px",
    flexShrink: 0,
    letterSpacing: "0.08em",
  },
  header: {
    position: "relative",
    marginBottom: "14px",
    padding: "0 42px 13px 0",
    borderBottom: "1px solid rgba(160, 112, 64, 0.44)",
  },
  eyebrow: {
    margin: "0 0 5px 0",
    color: "#9b744a",
    fontSize: "11px",
    letterSpacing: "0.18em",
  },
  statusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginBottom: "16px",
  },
  statusChip: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "rgba(255, 250, 239, 0.72)",
    border: "1px solid rgba(178, 128, 75, 0.32)",
    color: "#76583a",
    fontSize: "11px",
    letterSpacing: "0.04em",
  },
  message: {
    margin: "0",
    lineHeight: "1.9",
    color: "#4a4a4a",
    fontSize: "14.5px",
    whiteSpace: "pre-wrap",
  },
  omenBox: {
    margin: "16px 0 0",
    padding: "12px 13px",
    borderRadius: "10px",
    background: "rgba(255, 250, 239, 0.72)",
    border: "1px solid rgba(178, 128, 75, 0.28)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.55)",
  },
  omenHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "7px",
    color: "#6d5132",
    fontSize: "12px",
    letterSpacing: "0.12em",
  },
  omenDot: {
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    boxShadow: "0 0 10px currentColor",
    flexShrink: 0,
  },
  omenText: {
    margin: "0",
    color: "#5d4e37",
    fontSize: "12px",
    lineHeight: "1.7",
  },
  omenWorldNote: {
    margin: "7px 0 0",
    color: "#8b7355",
    fontSize: "11px",
    lineHeight: "1.6",
  },
  sender: {
    marginTop: "15px",
    textAlign: "right",
    fontSize: "12px",
    color: "#8b7355",
    fontStyle: "italic",
  },
  footerNote: {
    margin: "18px 0 0 0",
    paddingTop: "12px",
    borderTop: "1px dashed rgba(139, 115, 85, 0.28)",
    color: "#8b7355",
    fontSize: "11px",
    lineHeight: "1.6",
    textAlign: "center",
  },
};

/**
 * 瓶の中のメッセージを表示するカード
 * @param props - コンポーネントのプロパティ
 */
export const MessageCard = memo(({
  message,
  sender,
  currentDate,
  omen,
  onClose,
}: MessageCardProps) => {
  const discoveryLabel = getBottleDiscoveryLabel(currentDate);
  const { size } = useThree();
  const distanceFactor = size.width < 520 ? 6.2 : 10;
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    stopCardEvent(event);
    onClose();
  };
  const handleClosePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    stopCardEvent(event);
  };
  const stopContainerEvent = (event: CardPointerEvent) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  };

  return (
    <Html center distanceFactor={distanceFactor} style={{ pointerEvents: "all" }}>
      <div
        style={CARD_STYLES.container}
        onClick={stopContainerEvent}
        onPointerDown={stopContainerEvent}
      >
        <button
          type="button"
          onClick={handleClose}
          onPointerDown={handleClosePointerDown}
          style={CARD_STYLES.closeButton}
          aria-label="便りを閉じる"
        >
          ×
        </button>
        <div style={CARD_STYLES.header}>
          <p style={CARD_STYLES.eyebrow}>DRIFTING NOTE</p>
          <h3 style={CARD_STYLES.title}>海からの便り</h3>
        </div>
        <div style={CARD_STYLES.content}>
          <div style={CARD_STYLES.statusRow}>
            <span style={CARD_STYLES.statusChip}>{formatJournalDate(currentDate)}</span>
            <span style={CARD_STYLES.statusChip}>今日のしるし: {discoveryLabel}</span>
          </div>
          <p style={CARD_STYLES.message}>{message}</p>
          <div style={CARD_STYLES.sender}>— {sender}</div>
          <div style={CARD_STYLES.omenBox}>
            <div style={CARD_STYLES.omenHeader}>
              <span
                style={{
                  ...CARD_STYLES.omenDot,
                  color: omen.color,
                  background: omen.color,
                }}
              />
              <span>今日の効き目: {omen.label}</span>
            </div>
            <p style={CARD_STYLES.omenText}>{omen.description}</p>
            <p style={CARD_STYLES.omenWorldNote}>{omen.worldNote}</p>
          </div>
          <p style={CARD_STYLES.footerNote}>
            閉じると、今日の効き目が水面に残ります。
          </p>
        </div>
      </div>
    </Html>
  );
});

MessageCard.displayName = "MessageCard";
