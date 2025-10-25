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
  const [currentSender, setCurrentSender] = useState<string>("");
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
    // クリックごとに新しいメッセージと送り主を取得
    const now = new Date();
    const hour = now.getHours();
    const { message, sender } = getRandomMessage(season, hour);
    setCurrentMessage(message);
    setCurrentSender(sender);
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
                  — {currentSender}
                </div>
              </div>
            </div>
          </Html>
        )}
    </group>
  );
};

// 時間帯の判定
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 11) return "morning";    // 朝（5-10時）
  if (hour >= 11 && hour < 17) return "afternoon"; // 昼（11-16時）
  if (hour >= 17 && hour < 21) return "evening";   // 夕方（17-20時）
  return "night";                                   // 夜（21-4時）
};

// 送り主のリスト
const senders = [
  "漂流者より",
  "遠い島の住人より",
  "旅する船乗りより",
  "海辺の詩人より",
  "灯台守より",
  "未来の自分より",
  "過去の旅人より",
  "星を見る者より",
  "風を追う者より",
  "波を聴く者より",
  "名もなき友より",
  "時の旅人より",
];

// 季節と時間帯に応じたランダムなメッセージと送り主を返す関数
const getRandomMessage = (
  season: "spring" | "summer" | "autumn" | "winter",
  hour: number
): { message: string; sender: string } => {
  const timeOfDay = getTimeOfDay(hour);

  // 季節 × 時間帯のメッセージマップ
  const messages: Record<string, Record<TimeOfDay, string[]>> = {
    spring: {
      morning: [
        `春の朝。

目覚めたばかりの世界。
朝露に濡れた花びらが
キラキラと輝いています。

新しい一日の始まり。
今日は何を始めますか？`,
        `春眠暁を覚えず。

でも、今朝は目覚めましたね。
桜の香りが風に乗って
届いているはずです。

素敵な一日を。`,
        `朝の光と共に。

春の朝は希望に満ちています。
鳥のさえずりを聞きながら、
深呼吸してみてください。

今日も良い日になりますように。`,
      ],
      afternoon: [
        `春の昼下がり。

暖かな日差しの中、
のんびり過ごす時間。

急がなくていい。
自分のペースで。`,
        `桜の下で。

満開の桜の下、
お昼ご飯はどうでしたか？

春の味覚を
楽しんでくださいね。`,
        `穏やかな午後。

春風が心地よい季節。
少し休憩して、
リフレッシュしましょう。`,
      ],
      evening: [
        `夕暮れの桜。

夕日に照らされた桜は
格別に美しい。

一日お疲れ様でした。`,
        `春の夕べ。

少し肌寒くなってきましたね。
暖かいお茶でも飲んで、
一日を振り返ってみては？`,
        `宵の春。

星が出始める時間。
春の夜空も美しいですよ。

今日も頑張りましたね。`,
      ],
      night: [
        `春の夜。

静かな夜の帳が下りました。
花びらが月明かりに
浮かび上がっています。

ゆっくり休んでください。`,
        `夜桜の下で。

夜に咲く桜もまた美しい。
明日への活力を
蓄える時間です。

おやすみなさい。`,
        `春宵一刻値千金。

春の夜は貴重な時間。
今日一日を労って、
ゆっくり休みましょう。`,
      ],
    },
    summer: {
      morning: [
        `夏の朝。

眩しい太陽が昇ってきました。
今日も暑くなりそうですね。

水分補給を忘れずに！`,
        `早朝の涼しさ。

夏の朝は一日で
最も気持ちいい時間。

この清々しさを胸に
一日を始めましょう。`,
        `朝の海。

波の音が聞こえますか？
夏の朝は可能性に満ちています。

さあ、行動を起こしましょう。`,
      ],
      afternoon: [
        `真夏の太陽。

太陽が真上に。
暑さに負けないで。

木陰で休憩することも
忘れずに。`,
        `夏の昼下がり。

暑いですね。
無理せず、こまめに休息を。

頑張りすぎないことも
大切です。`,
        `輝く午後。

夏の光が全てを
キラキラと照らしています。

情熱を持って、
でも無理はせずに。`,
      ],
      evening: [
        `夕涼み。

ようやく涼しくなってきました。
暑い一日、お疲れ様でした。

夕風が心地よいですね。`,
        `夏の夕焼け。

赤く染まる空。
今日も一日頑張りましたね。

冷たい飲み物でも
いかがですか？`,
        `夕暮れの海。

波が静かに打ち寄せています。
今日の疲れを
波に流してしまいましょう。`,
      ],
      night: [
        `夏の夜。

星が綺麗ですね。
花火の音が聞こえてきそう。

夏の夜を
楽しんでください。`,
        `夜風に吹かれて。

ようやく涼しくなりました。
今日も一日お疲れ様。

ゆっくり休んでくださいね。`,
        `夏の星空。

天の川が見えますか？
願い事をしてみては？

明日も素敵な一日に。`,
      ],
    },
    autumn: {
      morning: [
        `秋の朝。

爽やかな空気が
心地よい季節。

実りの秋を
楽しみましょう。`,
        `秋晴れの朝。

高く澄んだ空。
紅葉が美しく色づいています。

今日も良い日に
なりますように。`,
        `朝露に濡れて。

秋の朝は少し肌寒い。
でもその分、空気が澄んで
気持ちいいですね。`,
      ],
      afternoon: [
        `秋の午後。

落ち葉が舞い落ちる。
変化は美しいものです。

前を向いて
歩いてください。`,
        `実りの昼下がり。

収穫の季節。
君の努力も
実を結ぶ時が来ています。`,
        `穏やかな秋の日。

読書でもしながら
ゆったり過ごすのも
いいですね。`,
      ],
      evening: [
        `秋の夕暮れ。

日が短くなりましたね。
紅葉が夕日に照らされて
美しく輝いています。

今日も一日お疲れ様。`,
        `夕焼け空。

秋の夕焼けは
特別に美しい。

今日一日を振り返って、
明日への準備を。`,
        `黄昏時。

秋の夜長が始まります。
温かいものを飲んで、
心も体も温めて。`,
      ],
      night: [
        `秋の夜長。

虫の音が聞こえますか？
読書や趣味に没頭する
良い時間です。

有意義な夜を。`,
        `月が綺麗ですね。

秋の夜空は澄んでいて、
月がとても美しい。

ゆっくり休んで、
明日に備えましょう。`,
        `静かな秋の夜。

落ち着いた時間を
過ごしていますか？

心穏やかに
おやすみなさい。`,
      ],
    },
    winter: {
      morning: [
        `冬の朝。

凍てつく寒さですね。
でも朝日が昇れば、
少し暖かくなるはず。

今日も頑張りましょう。`,
        `霜の朝。

寒い朝ですが、
白く輝く景色は
とても美しい。

暖かくして
お出かけください。`,
        `冬晴れの朝。

冷たい空気が
心地よく感じる日。

深呼吸して、
一日を始めましょう。`,
      ],
      afternoon: [
        `冬の午後。

寒いですね。
温かいものを飲んで、
体を温めてください。

もう少しで春です。`,
        `静かな冬の日。

雪が降っていますか？
外は寒くても、
心は暖かく。`,
        `冬の陽だまり。

寒い中でも、
日の当たる場所は
ほんのり暖かい。

小さな幸せを
大切に。`,
      ],
      evening: [
        `冬の夕暮れ。

日が沈むと一段と寒くなりますね。
暖かい部屋で、
ゆっくり過ごしてください。

今日もお疲れ様でした。`,
        `雪降る夕べ。

白い雪が静かに降っています。
一日の疲れを癒す時間。

温かい食事を
楽しんでくださいね。`,
        `冬の夜が来る。

早く暗くなる季節。
家族や友人と
暖かく過ごしてください。`,
      ],
      night: [
        `冬の夜。

星が綺麗ですね。
澄んだ空気の中、
星が輝いています。

暖かくして
おやすみなさい。`,
        `長い夜。

冬の夜は長い。
ゆっくり休んで、
明日への力を蓄えましょう。

おやすみなさい。`,
        `雪の夜。

静かに雪が降り積もっています。
困難な時こそ、
希望の光を見失わないで。

君は一人じゃない。`,
      ],
    },
  };

  const timeMessages = messages[season][timeOfDay];
  const message = timeMessages[Math.floor(Math.random() * timeMessages.length)];
  const sender = senders[Math.floor(Math.random() * senders.length)];

  return { message, sender };
};
