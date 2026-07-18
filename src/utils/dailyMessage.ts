/**
 * 毎日のメッセージAPI関連のユーティリティ
 */

export interface DailyMessageResponse {
  date: string;
  dateDescription: string;
  message: string;
  generatedAt: string;
  source?: 'gemini' | 'cloudflare-ai' | 'fallback';
  cacheTtl?: number;
}

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isTodayCache = (dateKey: string) => {
  const today = getLocalDateKey();
  return dateKey === today || dateKey.includes(today);
};

const readCachedMessage = (cacheKey: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }

    const cachedData: DailyMessageResponse = JSON.parse(cached);
    return isTodayCache(cachedData.date) ? cachedData.message : null;
  } catch {
    try {
      window.localStorage.removeItem(cacheKey);
    } catch {
      // 破損キャッシュの削除に失敗しても、API取得へ進めばよい
    }
    return null;
  }
};

const writeCachedMessage = (cacheKey: string, data: DailyMessageResponse) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // キャッシュできなくても、取得した本文は返す
  }
};

/**
 * 毎日のメッセージをAPIから取得
 * localStorageでキャッシュして1日1回のみ取得
 */
export async function fetchDailyMessage(): Promise<string | null> {
  const CACHE_KEY = 'daily_message_cache_v4';
  const API_ENDPOINT = '/api/daily-message';

  try {
    const cachedMessage = readCachedMessage(CACHE_KEY);
    if (cachedMessage) {
      return cachedMessage;
    }

    // APIから取得。Vite単体のdev serverではFunctions APIがなくHTMLが返るため、
    // JSON以外は通常のフォールバックとして扱う。
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return null;
    }

    const data: DailyMessageResponse = await response.json();

    writeCachedMessage(CACHE_KEY, data);

    return data.message;
  } catch {
    return null;
  }
}
