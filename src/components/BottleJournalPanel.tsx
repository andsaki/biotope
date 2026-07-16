import React from "react";
import { tokens } from "@/styles/tokens";
import { formatJournalDate, type BottleJournalEntry } from "@/utils/bottleJournal";

interface BottleJournalPanelProps {
  entries: BottleJournalEntry[];
  isMobile: boolean;
}

const getMessageFragment = (message: string) => {
  const normalized = message.replace(/\s+/g, " ").trim();
  if (normalized.length <= 58) {
    return normalized;
  }

  return `${normalized.slice(0, 58)}…`;
};

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
          まだ採集帳は白紙です。漂流瓶を読むと、水辺に残った徴がここへ写ります。
        </div>
      ) : (
        entries.slice(0, 3).map((entry) => (
          <article
            key={entry.date}
            style={{
              padding: tokens.spacing.md,
              borderRadius: "12px",
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.045))",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "rgba(255, 255, 255, 0.82)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "5px",
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? "12px" : "13px",
                color: "rgba(255, 255, 255, 0.94)",
                letterSpacing: "0.06em",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "999px",
                  background: entry.omen?.color ?? "rgba(255, 255, 255, 0.72)",
                  boxShadow: entry.omen ? `0 0 10px ${entry.omen.color}` : "none",
                  flexShrink: 0,
                }}
              />
              <span>{formatJournalDate(entry.date)}</span>
              {entry.omen && <span>/ {entry.omen.label}</span>}
            </div>
            <p
              style={{
                margin: "0 0 7px",
                fontFamily: tokens.typography.fontFamily.serif,
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: 1.65,
                color: "rgba(255, 255, 255, 0.86)",
              }}
            >
              「{getMessageFragment(entry.message)}」
            </p>
            <p
              style={{
                margin: 0,
                fontSize: isMobile ? "11px" : "12px",
                lineHeight: 1.55,
                color: "rgba(255, 255, 255, 0.66)",
              }}
            >
              {entry.lifeLog}
            </p>
            {entry.omen && (
              <p
                style={{
                  margin: "7px 0 0",
                  fontSize: isMobile ? "11px" : "12px",
                  lineHeight: 1.5,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {entry.omen.worldNote}
              </p>
            )}
          </article>
        ))
      )}
    </div>
  );
};
