import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

interface DriftingBottleProps {
  position: [number, number, number];
  onMessageRead?: () => void;
}

export const DriftingBottle = ({
  position,
  onMessageRead,
}: DriftingBottleProps) => {
  const bottleRef = useRef<THREE.Group>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [hovered, setHovered] = useState(false);
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
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                fontFamily: "'Noto Serif JP', serif",
                position: "relative",
                border: "2px solid #d4a574",
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
                }}
              >
                海からの便り
              </h3>
              <p
                style={{
                  margin: "0",
                  lineHeight: "1.8",
                  color: "#4a4a4a",
                  fontSize: "14px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {getRandomMessage()}
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
          </Html>
        )}
    </group>
  );
};

// ランダムなメッセージを返す関数
const getRandomMessage = () => {
  const messages = [
    `親愛なる発見者へ、

この瓶を見つけてくれてありがとう。
私は遠い海を旅する船乗りです。
波の音を聞きながら、
あなたの幸せを祈っています。

穏やかな日々が続きますように。`,

    `こんにちは、

今日は美しい夕日を見ました。
オレンジ色に染まる空と海が
とても綺麗でした。

この瓶があなたのもとへ
辿り着けたことを嬉しく思います。`,

    `拝啓

季節は巡り、また春が来ました。
新しい出会いと発見が
あなたを待っていますように。

遥か彼方より`,

    `Dear Friend,

時には立ち止まって
水面を眺めるのもいいものです。
ゆっくりと流れる時間の中で
大切なものが見えてくるはずです。`,

    `いつか、どこかで、

私たちは同じ空を見上げ、
同じ風を感じているのかもしれません。
この小さな瓶が
世界の広さと繋がりを
教えてくれますように。`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};
