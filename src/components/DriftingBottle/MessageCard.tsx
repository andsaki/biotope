import { memo } from "react";
import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  formatJournalDate,
  getBottleDiscoveryLabel,
  type BottleOmen,
} from "@/utils/bottleJournal";
import { CARD_STYLES } from "./messageCardStyles";

/** メッセージカードのプロパティ */
interface MessageCardProps {
  /** メッセージ本文 */
  message: string;
  /** 送り主 */
  sender: string;
  /** 表示中の便りの日付 */
  currentDate: string;
  /** 便りが拾った日の水辺の記録 */
  lifeLog: string;
  /** 便りを閉じた後に水辺へ残る小さな徴 */
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

/**
 * 瓶の中のメッセージを表示するカード
 * @param props - コンポーネントのプロパティ
 */
export const MessageCard = memo(({
  message,
  sender,
  currentDate,
  lifeLog,
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
          <p style={CARD_STYLES.eyebrow}>WATERLOG / BOTTLE No. 1</p>
          <h3 style={CARD_STYLES.title}>漂着した観察記録</h3>
        </div>
        <div className="message-card-scroll" style={CARD_STYLES.content}>
          <div style={CARD_STYLES.statusRow}>
            <span style={CARD_STYLES.statusChip}>{formatJournalDate(currentDate)}</span>
            <span style={CARD_STYLES.statusChip}>封蝋: {discoveryLabel}</span>
          </div>
          <p style={CARD_STYLES.message}>{message}</p>
          <div style={CARD_STYLES.lifeLogBox}>
            <p style={CARD_STYLES.lifeLogHeader}>採取時の水辺</p>
            <p style={CARD_STYLES.lifeLogText}>{lifeLog}</p>
          </div>
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
              <span>封を切ったあとの徴: {omen.label}</span>
            </div>
            <p style={CARD_STYLES.omenText}>{omen.description}</p>
            <p style={CARD_STYLES.omenWorldNote}>{omen.worldNote}</p>
          </div>
          <p style={CARD_STYLES.footerNote}>
            封を戻すと、この徴だけが水面へ帰ります。
          </p>
        </div>
      </div>
    </Html>
  );
});

MessageCard.displayName = "MessageCard";
