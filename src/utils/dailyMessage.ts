/**
 * 毎日のメッセージAPI関連のユーティリティ
 */

export interface DailyMessageResponse {
  date: string;
  dateDescription: string;
  message: string;
  generatedAt: string;
  source?: 'gemini' | 'fallback';
  cacheTtl?: number;
}

/**
 * 毎日のメッセージをAPIから取得
 * localStorageでキャッシュして1日1回のみ取得
 */
export async function fetchDailyMessage(): Promise<string | null> {
  const CACHE_KEY = 'daily_message_cache';
  const API_ENDPOINT = '/api/daily-message';

  try {
    // キャッシュチェック
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const cachedData: DailyMessageResponse = JSON.parse(cached);
      const today = new Date().toISOString().split('T')[0];

      // 日付が同じならキャッシュを返す
      if (cachedData.date === today) {
        return cachedData.message;
      }
    }

    // APIから取得
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      console.error('Failed to fetch daily message:', response.status);
      return null;
    }

    const data: DailyMessageResponse = await response.json();

    // キャッシュに保存
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));

    return data.message;
  } catch (error) {
    console.error('Error fetching daily message:', error);
    return null;
  }
}
