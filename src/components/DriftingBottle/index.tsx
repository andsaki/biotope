import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { fetchDailyMessage } from "../../utils/dailyMessage";
import { useBottleAnimation } from "../../hooks/useBottleAnimation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useClockTime, useSeason } from "@/contexts";
import { getTimeOfDay } from "@/utils/time";
import {
  createDailyLifeLog,
  createLocalBottleMessage,
  getBottleDiscoveryLabel,
  getDailyBottleOmen,
  getLocalDateKey,
  loadBottleJournal,
  loadBottleMemorySigns,
  saveBottleMemorySign,
  saveBottleJournalEntry,
  type BottleJournalEntry,
  type BottleMemorySign,
  type WindDirection,
} from "@/utils/bottleJournal";
import type { WeatherSnapshot } from "@/utils/weather";
import { BottleMemoryMarks } from "./BottleMemoryMarks";
import { BottleModel } from "./BottleModel";
import { BottleOmenNotice } from "./BottleOmenNotice";
import { BottleReadAfterglow } from "./BottleReadAfterglow";
import { MessageCard } from "./MessageCard";

/** 漂流瓶のプロパティ */
interface DriftingBottleProps {
  /** 瓶の位置 [x, y, z] */
  position: [number, number, number];
  /** メッセージが読まれた時のコールバック */
  onMessageRead?: () => void;
  /** 初回導線ヒントの表示 */
  showHint?: boolean;
  /** 現在の風向き */
  windDirection?: WindDirection;
  /** 現在の天気 */
  weather: WeatherSnapshot;
}

/**
 * 海に漂う瓶のコンポーネント
 * クリックすると季節と時間帯に応じたメッセージが表示される
 * @param props - コンポーネントのプロパティ
 */
export const DriftingBottle = ({
  position,
  onMessageRead,
  showHint = false,
  windDirection = "East",
  weather,
}: DriftingBottleProps) => {
  const { season } = useSeason();
  const realTime = useClockTime();
  const [showMessage, setShowMessage] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentSender, setCurrentSender] = useState("");
  const [displayedLifeLog, setDisplayedLifeLog] = useState("");
  const [dailyMessageFetched, setDailyMessageFetched] = useState(false);
  const [readAfterglowId, setReadAfterglowId] = useState(0);
  const [showOmenNotice, setShowOmenNotice] = useState(false);
  const [memorySigns, setMemorySigns] = useState<BottleMemorySign[]>(() =>
    loadBottleMemorySigns()
  );
  const [, setJournalEntries] = useState<BottleJournalEntry[]>(() =>
    loadBottleJournal()
  );
  const closeHandledRef = useRef(false);
  const isMobile = useIsMobile();

  const bottleRef = useBottleAnimation(position);
  const today = useMemo(() => getLocalDateKey(), []);
  const lifeLog = useMemo(
    () =>
      createDailyLifeLog({
        date: today,
        season,
        timeOfDay: getTimeOfDay(realTime.hours),
        windDirection,
        weather,
      }),
    [realTime.hours, season, today, weather, windDirection]
  );
  const bottleOmen = useMemo(
    () =>
      getDailyBottleOmen({
        date: today,
        season,
        timeOfDay: getTimeOfDay(realTime.hours),
        windDirection,
        weather,
      }),
    [realTime.hours, season, today, weather, windDirection]
  );

  // 1日1回、Gemini経由でメッセージを取得
  useEffect(() => {
    const loadDailyMessage = async () => {
      const message = await fetchDailyMessage();
      if (message) {
        setCurrentMessage(message);
        setCurrentSender("海からの便り");
      } else {
        setCurrentMessage(
          createLocalBottleMessage({
            date: today,
            season,
            timeOfDay: getTimeOfDay(realTime.hours),
            windDirection,
            weather,
            omen: bottleOmen,
          })
        );
        setCurrentSender("海からの便り");
      }
    };

    if (!dailyMessageFetched) {
      loadDailyMessage();
      setDailyMessageFetched(true);
    }
  }, [bottleOmen, dailyMessageFetched, realTime.hours, season, today, weather, windDirection]);

  const handleClick = () => {
    // 1日中同じGemini生成メッセージを表示
    closeHandledRef.current = false;
    setDisplayedLifeLog(lifeLog);
    setShowMessage(true);
    onMessageRead?.();
  };

  useEffect(() => {
    if (!showMessage || !currentMessage || !currentSender || !displayedLifeLog) {
      return;
    }

    const nextJournal = saveBottleJournalEntry({
      date: today,
      message: currentMessage,
      sender: currentSender,
      lifeLog: displayedLifeLog,
      omen: bottleOmen,
      readAt: new Date().toISOString(),
    });
    setJournalEntries(nextJournal);
  }, [bottleOmen, currentMessage, currentSender, displayedLifeLog, showMessage, today]);

  const handleCloseMessage = useCallback(() => {
    if (closeHandledRef.current) {
      return;
    }

    closeHandledRef.current = true;
    setShowMessage(false);
    setShowOmenNotice(true);
    setMemorySigns(
      saveBottleMemorySign({
        date: today,
        label: getBottleDiscoveryLabel(today),
        omen: bottleOmen,
        readAt: new Date().toISOString(),
      })
    );
    setReadAfterglowId((id) => id + 1);
  }, [bottleOmen, today]);

  useEffect(() => {
    if (!showMessage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleCloseMessage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCloseMessage, showMessage]);

  useEffect(() => {
    if (!showOmenNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowOmenNotice(false);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [showOmenNotice]);

  return (
    <group
      ref={bottleRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 見た目は変えず、漂流瓶を少し雑に押しても反応するようにする */}
      <mesh position={[0, 0.1, 0]} scale={[0.72, 1.18, 0.72]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <BottleModel hovered={hovered} />
      <BottleMemoryMarks signs={memorySigns} />
      {showHint && !showMessage && (
        <Html position={[0, 1.3, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: isMobile ? "8px 12px" : "10px 14px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "999px",
              background: "rgba(12, 20, 30, 0.56)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "rgba(255, 255, 255, 0.92)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.28)",
              fontFamily: "'Noto Serif JP', serif",
              fontSize: isMobile ? "12px" : "13px",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "瓶をタップして便りを読む" : "瓶をクリックして便りを読む"}
          </div>
        </Html>
      )}
      {showMessage && (
        <MessageCard
          message={currentMessage}
          sender={currentSender}
          currentDate={today}
          lifeLog={displayedLifeLog}
          omen={bottleOmen}
          onClose={handleCloseMessage}
        />
      )}
      {readAfterglowId > 0 && (
        <BottleReadAfterglow
          key={readAfterglowId}
          color={bottleOmen.color}
          onComplete={() => setReadAfterglowId(0)}
        />
      )}
      {showOmenNotice && !showMessage && (
        <BottleOmenNotice isMobile={isMobile} omen={bottleOmen} />
      )}
    </group>
  );
};
