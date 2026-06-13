import { memo } from "react";
import { Html } from "@react-three/drei";
import { formatJournalDate, type BottleJournalEntry } from "@/utils/bottleJournal";

/** メッセージカードのプロパティ */
interface MessageCardProps {
  /** メッセージ本文 */
  message: string;
  /** 送り主 */
  sender: string;
  /** 今日の観察ログ */
  lifeLog: string;
  /** 表示中の便りの日付 */
  currentDate: string;
  /** 保存済みの便り履歴 */
  journalEntries: BottleJournalEntry[];
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
  content: {
    overflowY: "auto" as const,
    paddingRight: "4px",
  },
  closeButton: {
    position: "absolute" as const,
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
  section: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(139, 115, 85, 0.28)",
  },
  sectionTitle: {
    margin: "0 0 8px 0",
    color: "#5d4e37",
    fontSize: "13px",
    letterSpacing: "0.08em",
  },
  lifeLog: {
    margin: "0",
    color: "#5f5548",
    fontSize: "12px",
    lineHeight: "1.7",
  },
  historyList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  historyItem: {
    padding: "9px 10px",
    borderRadius: "6px",
    background: "rgba(255, 248, 235, 0.62)",
    border: "1px solid rgba(212, 165, 116, 0.34)",
  },
  historyDate: {
    margin: "0 0 4px 0",
    color: "#8b7355",
    fontSize: "11px",
  },
  historyText: {
    margin: "0",
    color: "#4f4a42",
    fontSize: "12px",
    lineHeight: "1.6",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  },
  emptyHistory: {
    margin: "0",
    color: "#8b7355",
    fontSize: "12px",
    lineHeight: "1.6",
  },
};

/**
 * 瓶の中のメッセージを表示するカード
 * @param props - コンポーネントのプロパティ
 */
export const MessageCard = memo(({
  message,
  sender,
  lifeLog,
  currentDate,
  journalEntries,
  onClose,
}: MessageCardProps) => {
  const previousEntries = journalEntries.filter(
    (entry) => entry.date !== currentDate
  );

  return (
    <Html center distanceFactor={10} style={{ pointerEvents: "all" }}>
      <div style={CARD_STYLES.container} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={CARD_STYLES.closeButton}>
          ×
        </button>
        <h3 style={CARD_STYLES.title}>海からの便り</h3>
        <div style={CARD_STYLES.content}>
          <p style={CARD_STYLES.message}>{message}</p>
          <div style={CARD_STYLES.sender}>— {sender}</div>
          <section style={CARD_STYLES.section}>
            <h4 style={CARD_STYLES.sectionTitle}>今日の観察</h4>
            <p style={CARD_STYLES.lifeLog}>{lifeLog}</p>
          </section>
          <section style={CARD_STYLES.section}>
            <h4 style={CARD_STYLES.sectionTitle}>これまでの便り</h4>
            {previousEntries.length > 0 ? (
              <div style={CARD_STYLES.historyList}>
                {previousEntries.slice(0, 5).map((entry) => (
                  <article key={entry.date} style={CARD_STYLES.historyItem}>
                    <p style={CARD_STYLES.historyDate}>{formatJournalDate(entry.date)}</p>
                    <p style={CARD_STYLES.historyText}>{entry.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p style={CARD_STYLES.emptyHistory}>
                まだ過去の便りはありません。次に瓶を開くと、ここに記録が残ります。
              </p>
            )}
          </section>
        </div>
      </div>
    </Html>
  );
});

MessageCard.displayName = "MessageCard";
