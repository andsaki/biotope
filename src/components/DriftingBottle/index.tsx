import { useMemo, useRef, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fetchDailyMessage } from "../../utils/dailyMessage";
import { useBottleAnimation } from "../../hooks/useBottleAnimation";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useClockTime, useSeason } from "@/contexts";
import { getTimeOfDay } from "@/utils/time";
import {
  createDailyLifeLog,
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
import { BottleModel } from "./BottleModel";
import { MessageCard } from "./MessageCard";

interface BottleReadAfterglowProps {
  color: string;
  onComplete: () => void;
}

const AFTERGLOW_LIFETIME = 1.75;

const afterglowSeeds: readonly {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  lift: number;
}[] = [
  { angle: 0.1, radius: 0.2, speed: 0.82, size: 0.026, lift: 0.1 },
  { angle: 0.72, radius: 0.34, speed: 0.74, size: 0.018, lift: 0.16 },
  { angle: 1.35, radius: 0.28, speed: 0.68, size: 0.022, lift: 0.12 },
  { angle: 2.4, radius: 0.32, speed: 0.75, size: 0.02, lift: 0.18 },
  { angle: 3.55, radius: 0.38, speed: 0.61, size: 0.018, lift: 0.08 },
  { angle: 4.7, radius: 0.24, speed: 0.88, size: 0.021, lift: 0.14 },
  { angle: 5.62, radius: 0.36, speed: 0.7, size: 0.017, lift: 0.11 },
  { angle: 6.05, radius: 0.3, speed: 0.92, size: 0.015, lift: 0.2 },
];

const BottleReadAfterglow = ({ color, onComplete }: BottleReadAfterglowProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const sparkleMaterialRef = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#cffff5",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const startedAtRef = useMemo<{ value: number | null }>(() => ({ value: null }), []);
  const completedRef = useMemo(() => ({ value: false }), []);

  useEffect(() => {
    return () => {
      sparkleMaterialRef.dispose();
    };
  }, [sparkleMaterialRef]);

  useEffect(() => {
    sparkleMaterialRef.color.set(color);
  }, [color, sparkleMaterialRef]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    if (startedAtRef.value === null) {
      startedAtRef.value = state.clock.getElapsedTime();
    }

    const age = state.clock.getElapsedTime() - startedAtRef.value;
    const progress = Math.min(1, age / AFTERGLOW_LIFETIME);
    const fade = Math.pow(1 - progress, 1.7);

    groupRef.current.scale.setScalar(1 + progress * 0.9);
    groupRef.current.rotation.y = age * 0.55;
    sparkleMaterialRef.opacity = fade * 0.72;

    if (progress >= 1 && !completedRef.value) {
      completedRef.value = true;
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.12, 0]} renderOrder={24}>
      {afterglowSeeds.map((seed, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(seed.angle) * seed.radius * (1 + seed.speed * 0.7),
            0.035 + index * 0.004 + seed.lift,
            Math.sin(seed.angle) * seed.radius * (1 + seed.speed * 0.7),
          ]}
          rotation={[0, seed.angle, seed.angle * 0.37]}
          scale={[seed.size, seed.size * (1.3 + seed.speed * 0.25), seed.size]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <primitive object={sparkleMaterialRef} attach="material" />
        </mesh>
      ))}
    </group>
  );
};

interface BottleMemoryMarksProps {
  signs: BottleMemorySign[];
}

const createSignSeed = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const getSignPlacement = (date: string, index: number) => {
  const seed = createSignSeed(date);
  const angle = ((seed % 360) / 180) * Math.PI + index * 0.46;
  const radius = 0.72 + ((seed >>> 4) % 5) * 0.12;
  const size = 0.13 + ((seed >>> 8) % 4) * 0.016;
  return { angle, radius, size };
};

const BottleMemoryMarks = ({ signs }: BottleMemoryMarksProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f9ffd2",
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      ringMaterial.dispose();
    };
  }, [ringMaterial]);

  useFrame((state) => {
    if (!groupRef.current || signs.length === 0) {
      return;
    }

    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.16) * 0.08;
    ringMaterial.opacity = 0.1 + Math.sin(time * 0.9) * 0.025;
  });

  if (signs.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0.86, 0]} renderOrder={23}>
      {signs.slice(0, 7).map((sign, index) => {
        const placement = getSignPlacement(sign.date, index);
        const x = Math.cos(placement.angle) * placement.radius;
        const z = Math.sin(placement.angle) * placement.radius;
        const scale = placement.size * (1 - index * 0.045);
        const signColor = sign.omen?.color ?? "#fff2a8";

        return (
          <group key={sign.date} position={[x, 0.01 + index * 0.004, z]}>
            <mesh rotation={[-Math.PI / 2, 0, placement.angle]} scale={[scale, scale * 1.55, 1]}>
              <circleGeometry args={[1, 16]} />
              <meshBasicMaterial
                color={signColor}
                transparent={true}
                opacity={0.34}
                depthWrite={false}
                depthTest={true}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale * 2.7, scale * 2.7, 1]}>
              <ringGeometry args={[0.82, 1, 40]} />
              <primitive object={ringMaterial} attach="material" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

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
  const [memorySigns, setMemorySigns] = useState<BottleMemorySign[]>(() =>
    loadBottleMemorySigns()
  );
  const [, setJournalEntries] = useState<BottleJournalEntry[]>(() =>
    loadBottleJournal()
  );
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
        // APIが失敗した場合のフォールバック
        setCurrentMessage(
          "瓶の中の紙は、まだ少し湿っています。\n\n文字は読めないけれど、縁に残った潮の跡だけが今日の水辺を覚えています。"
        );
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

  const handleCloseMessage = () => {
    setShowMessage(false);
    setMemorySigns(
      saveBottleMemorySign({
        date: today,
        label: getBottleDiscoveryLabel(today),
        omen: bottleOmen,
        readAt: new Date().toISOString(),
      })
    );
    setReadAfterglowId((id) => id + 1);
  };

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
    </group>
  );
};
