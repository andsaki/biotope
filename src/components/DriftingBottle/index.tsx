import { useState } from "react";
import { useSeason } from "../../contexts/SeasonContext";
import { getRandomMessage } from "../../utils/messageUtils";
import { useBottleAnimation } from "../../hooks/useBottleAnimation";
import { BottleModel } from "./BottleModel";
import { MessageCard } from "./MessageCard";

/** 漂流瓶のプロパティ */
interface DriftingBottleProps {
  /** 瓶の位置 [x, y, z] */
  position: [number, number, number];
  /** メッセージが読まれた時のコールバック */
  onMessageRead?: () => void;
}

/**
 * 海に漂う瓶のコンポーネント
 * クリックすると季節と時間帯に応じたメッセージが表示される
 * @param props - コンポーネントのプロパティ
 */
export const DriftingBottle = ({
  position,
  onMessageRead,
}: DriftingBottleProps) => {
  const { season } = useSeason();
  const [showMessage, setShowMessage] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentSender, setCurrentSender] = useState("");

  const bottleRef = useBottleAnimation(position);

  const handleClick = () => {
    const hour = new Date().getHours();
    const { message, sender } = getRandomMessage(season, hour);
    setCurrentMessage(message);
    setCurrentSender(sender);
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
