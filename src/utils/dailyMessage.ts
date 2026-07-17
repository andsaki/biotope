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

/**
 * 毎日のメッセージをAPIから取得
 * localStorageでキャッシュして1日1回のみ取得
 */
export async function fetchDailyMessage(): Promise<string | null> {
  const CACHE_KEY = 'daily_message_cache_v3';
  const API_ENDPOINT = '/api/daily-message';

  try {
    // キャッシュチェック
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cachedData: DailyMessageResponse = JSON.parse(cached);
      // 日付が同じならキャッシュを返す
      if (isTodayCache(cachedData.date)) {
        return cachedData.message;
      }
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

    // キャッシュに保存
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));

    return data.message;
  } catch {
    return null;
  }
}
