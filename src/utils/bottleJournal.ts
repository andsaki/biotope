import type { Season } from "@/contexts/SeasonContext/context";
import type { WeatherSnapshot } from "@/utils/weather";
import type { TimeOfDay } from "./time";

export type WindDirection = "North" | "East" | "South" | "West";

export interface BottleJournalEntry {
  date: string;
  message: string;
  sender: string;
  lifeLog: string;
  omen?: BottleOmen;
  readAt: string;
}

export interface BottleMemorySign {
  date: string;
  label: string;
  omen?: BottleOmen;
  readAt: string;
}

export type BottleOmenId =
  | "fish-gather"
  | "quiet-ripples"
  | "firefly-glow"
  | "deep-current"
  | "hidden-shore";

export interface BottleOmen {
  id: BottleOmenId;
  label: string;
  description: string;
  worldNote: string;
  color: string;
}

interface LifeLogInput {
  date: string;
  season: Season;
  timeOfDay: TimeOfDay;
  windDirection: WindDirection;
  weather: WeatherSnapshot;
}

const JOURNAL_STORAGE_KEY = "mizube_bottle_journal";
const MEMORY_SIGNS_STORAGE_KEY = "mizube_bottle_memory_signs";
const MAX_JOURNAL_ENTRIES = 14;
const MAX_MEMORY_SIGNS = 10;

const clearInvalidStorage = (key: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
};

const seasonLabels: Record<Season, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};

const timeLabels: Record<TimeOfDay, string> = {
  morning: "朝",
  afternoon: "昼",
  evening: "夕方",
  night: "夜",
};

const windLabels: Record<WindDirection, string> = {
  North: "北",
  East: "東",
  South: "南",
  West: "西",
};

const weatherNotes: Record<WeatherSnapshot["condition"], readonly string[]> = {
  clear: [
    "空は明るく、水面の光もよく届いていた",
    "晴れた気配の中で、水の色が少し澄んで見えた",
  ],
  "partly-cloudy": [
    "雲間の光が水面をゆっくり横切った",
    "薄い雲の影が、岸から岸へ静かに流れた",
  ],
  cloudy: [
    "雲が光をやわらげ、水辺の影も静かだった",
    "曇り空の下で、水面の反射が落ち着いていた",
  ],
  fog: [
    "霧が水辺の輪郭を近くへ引き寄せていた",
    "遠い岸が白くほどけ、水音だけが残っていた",
  ],
  drizzle: [
    "細かな雨が、水面に淡い粒を重ねていた",
    "霧雨が岸辺を薄く濡らし続けていた",
  ],
  rain: [
    "雨粒が落ちるたび、水面に小さな輪が増えた",
    "雨の気配で、岸辺の音が少し近く聞こえた",
  ],
  showers: [
    "通り雨が水面を駆け抜け、すぐ遠ざかった",
    "強い雨粒が短いあいだ池の音を満たした",
  ],
  snow: [
    "白い粒が水辺へ落ち、音をひとつずつ消していた",
    "雪が水面の上でほどけ、冷たい光だけを残した",
  ],
  thunderstorm: [
    "遠い空が光り、少し遅れて水辺へ響いた",
    "雷の気配に合わせて、水面の影が一瞬揺れた",
  ],
};

const discoveryLabels = [
  "波紋の発見",
  "風向きのしるし",
  "光の漂着",
  "水面の記録",
] satisfies readonly string[];

const bottleOmens: readonly BottleOmen[] = [
  {
    id: "fish-gather",
    label: "魚寄せ",
    description: "魚影が瓶のそばで一度だけ向きをゆるめる。",
    worldNote: "瓶の周りに、魚が通ったあとの淡いしるしが残る。",
    color: "#b8f1ff",
  },
  {
    id: "quiet-ripples",
    label: "静かな波紋",
    description: "水面を触れたときの光が少し細く、長く残る。",
    worldNote: "水面に細い輪が残り、次の波を待っている。",
    color: "#f7f0c2",
  },
  {
    id: "firefly-glow",
    label: "蛍火",
    description: "夜の水辺で、小さな光の粒が瓶口を見に来る。",
    worldNote: "瓶の口元に、蛍のような点がゆっくり回る。",
    color: "#d6ff9f",
  },
  {
    id: "deep-current",
    label: "底流",
    description: "深いところの流れが少し強まり、影がゆっくり動く。",
    worldNote: "底から上がる青い粒が、短いあいだ水面へ向かう。",
    color: "#9fd7ff",
  },
  {
    id: "hidden-shore",
    label: "隠れ岸",
    description: "石や葉の影が濃くなり、岸の端だけがふっと浮く。",
    worldNote: "岸辺の影に、古い地図の端のような光が残る。",
    color: "#ffd5a3",
  },
] satisfies readonly BottleOmen[];

const seasonNotes: Record<Season, string[]> = {
  spring: [
    "水面に花びらが一枚、輪を描いて流れた",
    "浅瀬の色がやわらかく、岸辺が少し明るく見えた",
    "細い草の先に、春の光が長く残っていた",
  ],
  summer: [
    "蓮の葉が波に合わせて、ゆっくり向きを変えた",
    "水辺の空気が揺れて、光の粒が濃く見えた",
    "魚影が日差しを避けるように、少し深い方へ移った",
  ],
  autumn: [
    "落ち葉が水面で止まり、また小さく動き出した",
    "岸の影が澄んで、葉の色だけが静かに浮いた",
    "水面に残った葉脈が、夕方まで薄く光っていた",
  ],
  winter: [
    "水面の色が冷えて、魚の動きもゆっくりになった",
    "白い粒が落ちるたび、池の音が少し遠くなった",
    "岸辺の影が短く固まり、空気だけが澄んでいた",
  ],
};

const timeNotes: Record<TimeOfDay, string[]> = {
  morning: [
    "浅瀬には早い時間の静けさが残っていた",
    "光が低く入り、波紋の縁だけが見えた",
  ],
  afternoon: [
    "水面は明るく、動くものの影が短く沈んだ",
    "池の中央に光が集まり、岸辺は少し眠そうだった",
  ],
  evening: [
    "夕方の色が水面に伸び、輪郭がゆっくり溶けた",
    "沈む光に合わせて、漂うものの速度も落ちた",
  ],
  night: [
    "暗い水面に、見えるものだけが小さく残った",
    "夜の池は静かで、遠い反射だけが揺れていた",
  ],
};

const createSeed = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const pick = <T,>(items: readonly T[], seed: number) => items[seed % items.length];

export const getBottleDiscoveryLabel = (date: string) =>
  pick(discoveryLabels, createSeed(date));

export const getDailyBottleOmen = ({
  date,
  season,
  timeOfDay,
  windDirection,
  weather,
}: LifeLogInput): BottleOmen => {
  const seed = createSeed(
    `omen:${date}:${season}:${timeOfDay}:${windDirection}:${weather.condition}:${weather.trend}`
  );
  return pick(bottleOmens, seed);
};

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatJournalDate = (dateKey: string) => {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}月${Number(day)}日`;
};

export const createDailyLifeLog = ({
  date,
  season,
  timeOfDay,
  windDirection,
  weather,
}: LifeLogInput) => {
  const seed = createSeed(
    `${date}:${season}:${timeOfDay}:${windDirection}:${weather.condition}`
  );
  const seasonalText = pick(seasonNotes[season], seed);
  const timeText = pick(timeNotes[timeOfDay], seed >>> 3);
  const weatherText = pick(weatherNotes[weather.condition], seed >>> 5);
  const weatherSourceText = weather.source === "open-meteo"
    ? `${weather.locationSource === "browser" ? "現在地" : "近く"}の空は${weather.label}。`
    : "";
  const windText = `${windLabels[windDirection]}からの風。`;
  const forecastText = weather.forecastSummary ? `${weather.forecastSummary}。` : "";
  const eventText = weather.trend === "worsening"
    ? "空模様は少しずつ深まっていた。"
    : weather.trend === "clearing"
      ? "雲の向こうから光が戻ろうとしていた。"
      : (weather.windGusts ?? 0) >= 8
        ? "時折、強い風が水面を走った。"
        : weather.visibility < 8_000
          ? "遠い岸は淡い空気の中に隠れていた。"
          : "";

  return `${formatJournalDate(date)}、${seasonLabels[season]}の${timeLabels[timeOfDay]}。${weatherSourceText}${seasonalText}。${weatherText}。${eventText}${forecastText}${timeText}。${windText}`;
};

export const loadBottleJournal = (): BottleJournalEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawJournal = window.localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!rawJournal) {
      return [];
    }

    const parsed = JSON.parse(rawJournal);
    if (!Array.isArray(parsed)) {
      clearInvalidStorage(JOURNAL_STORAGE_KEY);
      return [];
    }

    return parsed.filter(
      (entry): entry is BottleJournalEntry =>
        typeof entry?.date === "string" &&
        typeof entry?.message === "string" &&
        typeof entry?.sender === "string" &&
        typeof entry?.lifeLog === "string" &&
        (entry.omen === undefined || isBottleOmen(entry.omen)) &&
        typeof entry?.readAt === "string"
    );
  } catch {
    clearInvalidStorage(JOURNAL_STORAGE_KEY);
    return [];
  }
};

export const saveBottleJournalEntry = (entry: BottleJournalEntry) => {
  if (typeof window === "undefined") {
    return [];
  }

  const withoutSameDate = loadBottleJournal().filter(
    (storedEntry) => storedEntry.date !== entry.date
  );
  const nextJournal = [entry, ...withoutSameDate]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_JOURNAL_ENTRIES);

  window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextJournal));
  return nextJournal;
};

export const loadBottleMemorySigns = (): BottleMemorySign[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawSigns = window.localStorage.getItem(MEMORY_SIGNS_STORAGE_KEY);
    if (!rawSigns) {
      return [];
    }

    const parsed = JSON.parse(rawSigns);
    if (!Array.isArray(parsed)) {
      clearInvalidStorage(MEMORY_SIGNS_STORAGE_KEY);
      return [];
    }

    return parsed.filter(
      (sign): sign is BottleMemorySign =>
        typeof sign?.date === "string" &&
        typeof sign?.label === "string" &&
        (sign.omen === undefined || isBottleOmen(sign.omen)) &&
        typeof sign?.readAt === "string"
    );
  } catch {
    clearInvalidStorage(MEMORY_SIGNS_STORAGE_KEY);
    return [];
  }
};

const isBottleOmen = (value: unknown): value is BottleOmen => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "id" in value &&
    "label" in value &&
    "description" in value &&
    "worldNote" in value &&
    "color" in value &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.description === "string" &&
    typeof value.worldNote === "string" &&
    typeof value.color === "string"
  );
};

export const saveBottleMemorySign = (sign: BottleMemorySign) => {
  if (typeof window === "undefined") {
    return [];
  }

  const withoutSameDate = loadBottleMemorySigns().filter(
    (storedSign) => storedSign.date !== sign.date
  );
  const nextSigns = [sign, ...withoutSameDate]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX_MEMORY_SIGNS);

  window.localStorage.setItem(MEMORY_SIGNS_STORAGE_KEY, JSON.stringify(nextSigns));
  return nextSigns;
};
