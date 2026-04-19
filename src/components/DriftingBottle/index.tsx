import { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { fetchDailyMessage } from "../../utils/dailyMessage";
import { useBottleAnimation } from "../../hooks/useBottleAnimation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { BottleModel } from "./BottleModel";
import { MessageCard } from "./MessageCard";

/** 漂流瓶のプロパティ */
interface DriftingBottleProps {
  /** 瓶の位置 [x, y, z] */
  position: [number, number, number];
  /** メッセージが読まれた時のコールバック */
  onMessageRead?: () => void;
  /** 初回導線ヒントの表示 */
  showHint?: boolean;
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
}: DriftingBottleProps) => {
  const [showMessage, setShowMessage] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentSender, setCurrentSender] = useState("");
  const [dailyMessageFetched, setDailyMessageFetched] = useState(false);
  const isMobile = useIsMobile();

  const bottleRef = useBottleAnimation(position);

  // 1日1回、Gemini経由でメッセージを取得
  useEffect(() => {
    const loadDailyMessage = async () => {
      const message = await fetchDailyMessage();
      if (message) {
        setCurrentMessage(message);
        setCurrentSender("海からの便り");
      } else {
        // APIが失敗した場合のフォールバック
        console.error('Failed to load daily message');
        setCurrentMessage("今日の海は静かで、便りはまだ届いていません。\n\nまた明日、お越しください。");
        setCurrentSender("海からの便り");
      }
    };

    if (!dailyMessageFetched) {
      loadDailyMessage();
      setDailyMessageFetched(true);
    }
  }, [dailyMessageFetched]);

  const handleClick = () => {
    // 1日中同じGemini生成メッセージを表示
    setShowMessage(true);
    onMessageRead?.();
  };

  const handleCloseMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessage(false);
  };

  return (
    <group
      ref={bottleRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <BottleModel hovered={hovered} />
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
          onClose={handleCloseMessage}
        />
      )}
    </group>
  );
};
