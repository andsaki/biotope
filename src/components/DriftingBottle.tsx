import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useSeason } from "../contexts/SeasonContext";

interface DriftingBottleProps {
  position: [number, number, number];
  onMessageRead?: () => void;
}

export const DriftingBottle = ({
  position,
  onMessageRead,
}: DriftingBottleProps) => {
  const { season } = useSeason();
  const bottleRef = useRef<THREE.Group>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const startTimeRef = useRef<number | null>(null);

  // 瓶の漂流アニメーション
  useFrame((state) => {
    if (bottleRef.current) {
      const time = state.clock.elapsedTime;

      // 開始時刻を記録
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }

      const elapsedTime = time - startTimeRef.current;

      // 遠くから漂流してくるアニメーション（30秒かけて）
      const driftProgress = Math.min(elapsedTime / 30, 1);
      const easeProgress = 1 - Math.pow(1 - driftProgress, 3); // イージング

      // 開始位置（遠く）から目的地へ
      const startX = -15; // 遠くの左側から
      const startZ = 10;  // 遠くの奥から
      const targetX = position[0];
      const targetZ = position[2];

      const currentX = startX + (targetX - startX) * easeProgress;
      const currentZ = startZ + (targetZ - startZ) * easeProgress;

      // 水面を漂流する動き（到着後はゆらゆら）
      bottleRef.current.position.x = currentX + Math.sin(time * 0.5) * 0.5 * driftProgress;
      bottleRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1; // もっと大きな上下の揺れ
      bottleRef.current.position.z = currentZ + Math.cos(time * 0.3) * 0.5 * driftProgress;

      // もっとダイナミックな回転と傾き
      bottleRef.current.rotation.x = Math.sin(time * 0.5) * 0.4; // X軸の傾きを大きく
      bottleRef.current.rotation.z = Math.cos(time * 0.4) * 0.5; // Z軸の傾きも大きく
      bottleRef.current.rotation.y = Math.sin(time * 0.3) * 0.3 + time * 0.05; // Y軸周りにゆっくり回転しながら揺れる
    }
  });

  const handleClick = () => {
    if (!showMessage) {
      setCurrentMessage(getRandomMessage(season));
    }
    setShowMessage(true);
    if (onMessageRead) {
      onMessageRead();
    }
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
        {/* 瓶の本体 */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.8, 16]} />
          <meshPhysicalMaterial
            color="#88ccaa"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>

        {/* 瓶の首 */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.3, 16]} />
          <meshPhysicalMaterial
            color="#88ccaa"
            transparent
            opacity={0.6}
            roughness={0.1}
            metalness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>

        {/* コルク栓 */}
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.15, 16]} />
          <meshStandardMaterial color="#d4a574" roughness={0.8} />
        </mesh>

        {/* 中の便箋（巻いた紙） */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 16]} />
          <meshStandardMaterial color="#f5e6d3" roughness={0.6} />
        </mesh>

        {/* ホバー時のハイライト */}
        {hovered && (
          <mesh>
            <cylinderGeometry args={[0.16, 0.13, 0.85, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}

        {/* 便箋の内容を表示 */}
        {showMessage && (
          <Html
            center
            distanceFactor={10}
            style={{
              pointerEvents: "all",
            }}
          >
            <div
              style={{
                background: "rgba(245, 230, 211, 0.98)",
                padding: "20px",
                borderRadius: "8px",
                minWidth: "300px",
                maxWidth: "400px",
                maxHeight: "500px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                fontFamily: "'Noto Serif JP', serif",
                position: "relative",
                border: "2px solid #d4a574",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseMessage}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#8b7355",
                }}
              >
                ×
              </button>
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: "#5d4e37",
                  fontSize: "18px",
                  borderBottom: "1px solid #d4a574",
                  paddingBottom: "10px",
                  flexShrink: 0,
                }}
              >
                海からの便り
              </h3>
              <div
                style={{
                  flex: 1,
                  overflowY: "scroll",
                  paddingRight: "10px",
                  minHeight: 0,
                }}
              >
                <p
                  style={{
                    margin: "0",
                    lineHeight: "1.8",
                    color: "#4a4a4a",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {currentMessage}
                </p>
                <div
                  style={{
                    marginTop: "15px",
                    textAlign: "right",
                    fontSize: "12px",
                    color: "#8b7355",
                    fontStyle: "italic",
                  }}
                >
                  — 漂流者より
                </div>
              </div>
            </div>
          </Html>
        )}
    </group>
  );
};

// 季節ごとのランダムなメッセージを返す関数
const getRandomMessage = (season: "spring" | "summer" | "autumn" | "winter") => {
  const seasonMessages = {
    spring: [
      `春の便り。

桜の花びらが舞う季節。
新しい始まりを感じます。

変化を恐れず、
一歩を踏み出してください。`,

      `芽吹きの季節。

冬の眠りから目覚めた大地。
君の心にも新しい芽が
育ち始めているはず。

その小さな芽を大切に。`,

      `春の風に乗せて。

暖かな日差しと共に、
希望を届けます。

今日という日を
精一杯生きてください。`,
    ],
    summer: [
      `夏の輝き。

太陽が高く昇る季節。
君も思い切り羽ばたいて。

情熱を失わないで。`,

      `真夏の海より。

青い空、青い海、
眩しい太陽。

夏の思い出を
作りましょう。`,

      `夕涼みの時間。

暑い一日を終えて、
水辺で涼む時間。

頑張りすぎないことも
大切です。`,
    ],
    autumn: [
      `秋の夕暮れ。

紅葉が美しく色づく季節。
変化は美しい。

前を向いて
歩いてください。`,

      `実りの秋。

君が蒔いた種が、
今、実を結ぼうとしています。

収穫の喜びを
感じてください。`,

      `秋風に乗せて。

落ち葉が水面に浮かぶ季節。
振り返ることも時には必要。

過去から学び、
未来へ進みましょう。`,
    ],
    winter: [
      `冬の静けさ。

雪が全てを白く覆う季節。
静寂の中にこそ、
本当の声が聞こえます。

自分自身と向き合う
時間を大切に。`,

      `寒い冬の日に。

この寒さを乗り越えれば、
必ず春が来ます。

暖かい場所で、
暖かい人たちと
過ごしてください。`,

      `冬の星空より。

澄んだ空気の中、
星が美しく輝いています。

困難な時こそ、
希望の光を見失わないで。

君は一人じゃない。`,
    ],
  };

  const messages = seasonMessages[season];
  return messages[Math.floor(Math.random() * messages.length)];
};
