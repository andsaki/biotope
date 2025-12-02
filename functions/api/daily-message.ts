/**
 * Cloudflare Functions - 毎日のメッセージ生成API
 * Gemini APIを使用してその日の日付に関連したメッセージを生成
 */

/// <reference types="@cloudflare/workers-types" />

interface Env {
  GEMINI_API_KEY: string;
  DAILY_MESSAGE_CACHE: KVNamespace;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * 月から季節を判定
 */
function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}

/**
 * 日付から日本語の表現を生成
 */
function getDateDescription(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  const season = getSeason(month);

  return `${month}月${day}日（${dayOfWeek}曜日）、${season}`;
}

/**
 * Gemini APIを呼び出してメッセージを生成
 */
async function generateDailyMessage(apiKey: string, dateStr: string): Promise<string> {
  const prompt = `あなたは詩人です。今日は${dateStr}です。
この日付に関連した、心温まるメッセージを日本語で1つ書いてください。
以下の条件を守ってください：
- 200文字以内
- 指定された季節に合った内容にする（他の季節の話は絶対にしない）
- 優しく前向きな内容
- です・ます調
- メッセージのみを出力（説明や前置きは不要）`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 300,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

/**
 * Cloudflare Functions のエントリーポイント
 */
export const onRequest = async (context: EventContext<Env, string, Record<string, unknown>>) => {
  // CORSヘッダーを設定
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONSリクエスト（プリフライト）の処理
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // 日本時間の今日の日付を取得
    const now = new Date();
    const japanTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
    const dateKey = `${japanTime.getFullYear()}-${String(japanTime.getMonth() + 1).padStart(2, '0')}-${String(japanTime.getDate()).padStart(2, '0')}`;
    const dateDescription = getDateDescription(japanTime);

    // KVキャッシュをチェック
    const cached = await context.env.DAILY_MESSAGE_CACHE.get(dateKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      return new Response(
        JSON.stringify(cachedData),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400',
            'X-Cache': 'HIT',
          },
        }
      );
    }

    // Gemini APIキーを取得
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // メッセージを生成
    const message = await generateDailyMessage(apiKey, dateDescription);

    // レスポンスデータを作成
    const responseData = {
      date: dateKey,
      dateDescription,
      message,
      generatedAt: new Date().toISOString(),
    };

    // KVに保存（24時間のTTL）
    await context.env.DAILY_MESSAGE_CACHE.put(
      dateKey,
      JSON.stringify(responseData),
      { expirationTtl: 86400 }
    );

    // レスポンスを返す
    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('Error generating daily message:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to generate daily message',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
