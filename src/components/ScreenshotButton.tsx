import { useState, type RefObject } from "react";

import { useClockTime, useSeason } from "@/contexts";
import { tokens } from "@/styles/tokens";

interface ScreenshotButtonProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isMobile: boolean;
}

const seasonLabels = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
} as const;

const formatNumber = (value: number) => value.toString().padStart(2, "0");

const getJapanDateParts = () => {
  const formatter = new Intl.DateTimeFormat("ja-JP-u-ca-gregory", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());

  return {
    year: parts.find((part) => part.type === "year")?.value ?? "0000",
    month: parts.find((part) => part.type === "month")?.value ?? "00",
    day: parts.find((part) => part.type === "day")?.value ?? "00",
  };
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildScreenshotBlob = (
  sourceCanvas: HTMLCanvasElement,
  watermarkLines: string[]
) =>
  new Promise<Blob>((resolve, reject) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    if (width === 0 || height === 0) {
      reject(new Error("Canvas is not ready"));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      reject(new Error("Canvas 2D context is not available"));
      return;
    }

    context.drawImage(sourceCanvas, 0, 0, width, height);

    const scale = Math.max(1, Math.min(width, height) / 720);
    const padding = 18 * scale;
    const lineHeight = 24 * scale;
    const fontSize = 18 * scale;
    const watermarkWidth = 320 * scale;
    const watermarkHeight = padding * 2 + lineHeight * watermarkLines.length;
    const x = width - watermarkWidth - padding;
    const y = height - watermarkHeight - padding;

    context.fillStyle = "rgba(19, 31, 44, 0.62)";
    context.fillRect(x, y, watermarkWidth, watermarkHeight);
    context.strokeStyle = "rgba(255, 255, 255, 0.22)";
    context.strokeRect(x, y, watermarkWidth, watermarkHeight);
    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    context.font = `${fontSize}px "Noto Serif JP", serif`;
    context.textAlign = "left";
    context.textBaseline = "top";

    watermarkLines.forEach((line, index) => {
      context.fillText(line, x + padding, y + padding + index * lineHeight);
    });

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG conversion failed"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });

export const ScreenshotButton = ({
  canvasRef,
  isMobile,
}: ScreenshotButtonProps) => {
  const { season } = useSeason();
  const realTime = useClockTime();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScreenshot = async () => {
    const sourceCanvas = canvasRef.current;
    if (!sourceCanvas || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      const { year, month, day } = getJapanDateParts();
      const hour = formatNumber(realTime.hours);
      const minute = formatNumber(realTime.minutes);
      const second = formatNumber(realTime.seconds);
      const timestamp = `${year}${month}${day}-${hour}${minute}${second}`;
      const watermarkLines = [
        "Mizube no Shiki",
        `${year}/${month}/${day} ${hour}:${minute}:${second} JST`,
        `季節: ${seasonLabels[season]}`,
      ];

      const blob = await buildScreenshotBlob(sourceCanvas, watermarkLines);
      downloadBlob(blob, `mizube-no-shiki-${timestamp}.png`);
    } catch (error) {
      console.error("Screenshot capture failed", error);
      setErrorMessage("保存できませんでした");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "stretch" : "flex-end",
        gap: tokens.spacing.xs,
        width: isMobile ? "100%" : "auto",
      }}
    >
      <button
        className="glass-control-button"
        type="button"
        onClick={handleScreenshot}
        disabled={isSaving || !canvasRef.current}
        aria-label="スクリーンショットを保存"
        title="スクリーンショットを保存"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "flex-start",
          gap: tokens.spacing.xs,
          fontFamily: tokens.typography.fontFamily.serif,
          fontSize: isMobile ? "13px" : "14px",
          fontWeight: 400,
          padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
          width: isMobile ? "100%" : "auto",
          borderRadius: "999px",
          border: "1px solid rgba(255, 255, 255, 0.22)",
          color: "rgba(255, 255, 255, 0.86)",
          background: "rgba(255, 255, 255, 0.08)",
          cursor: isSaving ? "wait" : "pointer",
          transition: tokens.transitions.base,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          opacity: canvasRef.current ? 1 : 0.65,
        }}
      >
        <span aria-hidden="true">📷</span>
        {isSaving ? "保存中" : "保存"}
      </button>
      {errorMessage && (
        <span
          role="status"
          style={{
            fontFamily: tokens.typography.fontFamily.serif,
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.78)",
            textAlign: isMobile ? "center" : "right",
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};
