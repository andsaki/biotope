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
  onComplete: () => void;
}

const AFTERGLOW_LIFETIME = 3.2;

const afterglowSeeds = [
  { angle: 0.1, radius: 0.34, speed: 0.82, size: 0.034 },
  { angle: 1.35, radius: 0.48, speed: 0.68, size: 0.026 },
  { angle: 2.4, radius: 0.42, speed: 0.75, size: 0.03 },
  { angle: 3.55, radius: 0.54, speed: 0.61, size: 0.024 },
  { angle: 4.7, radius: 0.38, speed: 0.88, size: 0.028 },
  { angle: 5.62, radius: 0.5, speed: 0.7, size: 0.022 },
] as const;

const BottleReadAfterglow = ({ onComplete }: BottleReadAfterglowProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringMaterialRef = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f7f0c2",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const coreMaterialRef = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#fff7c9",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const sparkleMaterialRef = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#cffff5",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const startedAtRef = useMemo(() => ({ value: null as number | null }), []);
  const completedRef = useMemo(() => ({ value: false }), []);

  useEffect(() => {
    return () => {
      ringMaterialRef.dispose();
      coreMaterialRef.dispose();
      sparkleMaterialRef.dispose();
    };
  }, [coreMaterialRef, ringMaterialRef, sparkleMaterialRef]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    if (startedAtRef.value === null) {
      startedAtRef.value = state.clock.getElapsedTime();
    }

    const age = state.clock.getElapsedTime() - startedAtRef.value;
    const progress = Math.min(1, age / AFTERGLOW_LIFETIME);
    const fade = Math.pow(1 - progress, 1.55);
    const pulse = 0.82 + Math.sin(age * 5.4) * 0.18;

    groupRef.current.scale.setScalar(1 + progress * 1.9);
    groupRef.current.rotation.y = age * 0.22;
    ringMaterialRef.opacity = fade * 0.28;
    coreMaterialRef.opacity = fade * 0.18 * pulse;
    sparkleMaterialRef.opacity = fade * 0.64;

    if (progress >= 1 && !completedRef.value) {
      completedRef.value = true;
      onComplete();
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.12, 0]} renderOrder={1003}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.52, 0.52, 1]}>
        <ringGeometry args={[0.76, 0.79, 96]} />
        <primitive object={ringMaterialRef} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.18, 0.18, 1]}>
        <circleGeometry args={[1, 32]} />
        <primitive object={coreMaterialRef} attach="material" />
      </mesh>
      {afterglowSeeds.map((seed, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(seed.angle) * seed.radius,
            0.035 + index * 0.006,
            Math.sin(seed.angle) * seed.radius,
          ]}
          rotation={[-Math.PI / 2, 0, seed.angle]}
          scale={[seed.size, seed.size * (1.15 + seed.speed * 0.2), 1]}
        >
          <circleGeometry args={[1, 14]} />
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
  const markMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#fff2a8",
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#f9ffd2",
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    return () => {
      markMaterial.dispose();
      ringMaterial.dispose();
    };
  }, [markMaterial, ringMaterial]);

  useFrame((state) => {
    if (!groupRef.current || signs.length === 0) {
      return;
    }

    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(time * 0.16) * 0.08;
    markMaterial.opacity = 0.52 + Math.sin(time * 1.4) * 0.08;
    ringMaterial.opacity = 0.24 + Math.sin(time * 0.9) * 0.05;
  });

  if (signs.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0.86, 0]} renderOrder={996}>
      {signs.slice(0, 7).map((sign, index) => {
        const placement = getSignPlacement(sign.date, index);
        const x = Math.cos(placement.angle) * placement.radius;
        const z = Math.sin(placement.angle) * placement.radius;
        const scale = placement.size * (1 - index * 0.045);

        return (
          <group key={sign.date} position={[x, 0.01 + index * 0.004, z]}>
            <mesh rotation={[-Math.PI / 2, 0, placement.angle]} scale={[scale, scale * 1.55, 1]}>
              <circleGeometry args={[1, 16]} />
              <primitive object={markMaterial} attach="material" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[scale * 4.4, scale * 4.4, 1]}>
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
      readAt: new Date().toISOString(),
    });
    setJournalEntries(nextJournal);
  }, [currentMessage, currentSender, displayedLifeLog, showMessage, today]);

  const handleCloseMessage = () => {
    setShowMessage(false);
    setMemorySigns(
      saveBottleMemorySign({
        date: today,
        label: getBottleDiscoveryLabel(today),
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
          onClose={handleCloseMessage}
        />
      )}
      {readAfterglowId > 0 && (
        <BottleReadAfterglow
          key={readAfterglowId}
          onComplete={() => setReadAfterglowId(0)}
        />
      )}
    </group>
  );
};
