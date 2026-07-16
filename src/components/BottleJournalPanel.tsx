import React from "react";
import { tokens } from "@/styles/tokens";
import { formatJournalDate, type BottleJournalEntry } from "@/utils/bottleJournal";

interface BottleJournalPanelProps {
  entries: BottleJournalEntry[];
  isMobile: boolean;
}

export const BottleJournalPanel: React.FC<BottleJournalPanelProps> = ({
  entries,
  isMobile,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gap: tokens.spacing.sm,
        maxHeight: isMobile ? "220px" : "260px",
        overflowY: "auto",
        padding: tokens.spacing.md,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        borderRadius: "14px",
        background: "rgba(9, 18, 28, 0.42)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      }}
    >
      {entries.length === 0 ? (
        <div
          style={{
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: isMobile ? "12px" : "13px",
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.72)",
          }}
        >
          まだ便りは残っていません。漂流瓶を読むと、ここに記録されます。
        </div>
      ) : (
        entries.slice(0, 3).map((entry) => (
          <article
            key={entry.date}
            style={{
              padding: tokens.spacing.sm,
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.82)",
            }}
          >
            <div
              style={{
                marginBottom: "5px",
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? "12px" : "13px",
                color: "rgba(255, 255, 255, 0.94)",
                letterSpacing: "0.06em",
              }}
            >
              {formatJournalDate(entry.date)}
              {entry.omen ? ` / ${entry.omen.label}` : ""}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? "11px" : "12px",
                lineHeight: 1.55,
                color: "rgba(255, 255, 255, 0.72)",
              }}
            >
              {entry.lifeLog}
            </p>
          </article>
        ))
      )}
    </div>
  );
};
