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

interface DailyMessagePayload {
  date: string;
  dateDescription: string;
  message: string;
  generatedAt: string;
  source: 'gemini' | 'fallback';
  cacheTtl: number;
}

const CACHE_TTL_SECONDS = 86400;
const FALLBACK_CACHE_TTL_SECONDS = 3600;

const FALLBACK_MESSAGES: Record<string, Record<string, string[]>> = {
  春: {
    朝: [
      '{date}、春の朝。優しい光に包まれて、今日も一歩ずつ。',
      '{date}の朝、新しい芽吹きを感じませんか。素敵な1日を。'
    ],
    昼: [
      '{date}、春の陽気が心地いいですね。小さな幸せを見つけましょう。',
      '{date}の午後、花のつぼみのように。あなたのペースで咲いてください。'
    ],
    夕方: [
      '{date}の夕暮れ、春の風が優しく吹いています。ゆっくり休んで。',
      '{date}の夕方、柔らかな光に包まれて。お疲れさまでした。'
    ],
    夜: [
      '{date}の夜、春の静けさが心を落ち着かせます。ゆっくりと。',
      '{date}、春の夜は穏やか。明日も良い日になりますように。'
    ]
  },
  夏: {
    朝: [
      '{date}の朝、夏の日差しが応援してくれています。今日も元気に。',
      '{date}、夏の朝。冷たい飲み物でひと息、今日も自分らしく。'
    ],
    昼: [
      '{date}の青空、まっすぐで気持ちいいですね。水分補給も忘れずに。',
      '{date}、暑さの中にも小さな風。あなたの笑顔が誰かの涼になります。'
    ],
    夕方: [
      '{date}の夕暮れ、夏の暑さも和らぎます。ゆっくり休んでください。',
      '{date}の夕方、涼しい風が心地よい。お疲れさまでした。'
    ],
    夜: [
      '{date}の夜、夏の星が輝いています。ゆっくりお休みください。',
      '{date}、夏の夜は静か。明日も素敵な1日になりますように。'
    ]
  },
  秋: {
    朝: [
      '{date}の朝、秋の空が澄んでいます。深呼吸して、穏やかな1日を。',
      '{date}、秋の朝。静かな気配、今日も自分のペースで大丈夫。'
    ],
    昼: [
      '{date}の午後、秋の風が少しひんやり。温かい飲み物とともに。',
      '{date}、色づく葉のように。あなたの努力も美しく実っています。'
    ],
    夕方: [
      '{date}の夕暮れ、秋の空が美しい。ゆっくり優しい時間を。',
      '{date}の夕方、秋の風に吹かれて。今日もお疲れさまでした。'
    ],
    夜: [
      '{date}の夜、秋の静けさに包まれて。ゆっくりお休みください。',
      '{date}、秋の夜長。明日も良い日になりますように。'
    ]
  },
  冬: {
    朝: [
      '{date}の冬の朝。凍える空気も、温かな光が優しく包み込みます。',
      '{date}、冬の朝は冷たいけれど、温かさも見つかります。ゆっくりと。'
    ],
    昼: [
      '{date}の午後、冬の空気が凛として清々しい。温かいものでひと息を。',
      '{date}、冬の日差しが優しい。小さな幸せを集める1日に。'
    ],
    夕方: [
      '{date}の夕暮れ、冬の寒さが身に染みます。温もりを大切に。',
      '{date}の夕方、冬の空が美しい。今日もお疲れさまでした。'
    ],
    夜: [
      '{date}の冬の夜、静かで穏やか。ゆっくりお休みください。',
      '{date}、冬の夜。温かくして、明日も良い日になりますように。'
    ]
  },
};

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
 * 時刻から時間帯を判定
 */
function getTimeOfDay(hour: number): '朝' | '昼' | '夕方' | '夜' {
  if (hour >= 5 && hour < 11) return '朝';
  if (hour >= 11 && hour < 17) return '昼';
  if (hour >= 17 && hour < 21) return '夕方';
  return '夜';
}

/**
 * 日付から日本語の表現を生成
 */
function getDateDescription(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  const season = getSeason(month);
  const timeOfDay = getTimeOfDay(date.getHours());

  return `${month}月${day}日（${dayOfWeek}曜日）、${season}の${timeOfDay}`;
}

/**
 * Gemini APIが使えない場合のフォールバックメッセージ生成
 */
function buildFallbackMessage(date: Date, dateDescription: string): string {
  const season = getSeason(date.getMonth() + 1);
  const timeOfDay = getTimeOfDay(date.getHours());
  const seasonMessages = FALLBACK_MESSAGES[season] ?? FALLBACK_MESSAGES['春'];
  const messages = seasonMessages[timeOfDay] ?? seasonMessages['朝'];
  const index = (date.getDate() - 1) % messages.length;
  return messages[index].replace('{date}', dateDescription);
}

/**
 * Gemini APIを呼び出してメッセージを生成
 */
async function generateDailyMessage(apiKey: string, dateStr: string): Promise<string> {
  const prompt = `あなたは優しい言葉で人々を励ます詩人です。今日は${dateStr}です。

この時間帯に心がほっと温まり、1日に少し彩を添えるような短いメッセージを書いてください。

【条件】
- 60-80文字以内（2行程度）
- ${dateStr}の季節と時間帯（朝・昼・夕方・夜）の美しさを優しく描く
- 時間帯に合った表現を使う（朝なら始まり、夜なら休息など）
- 前向きで軽やかな表現
- 心が温まる、ほっとする言葉選び
- です・ます調
- メッセージのみを出力（説明や前置きは不要）

【良い例】
- 朝：「冬の朝、温かい飲み物で一息つきませんか。小さな幸せが、あなたを待っていますよ。」（45文字）
- 昼：「春の風が背中を押してくれます。今日も一歩ずつ、自分のペースで。」（36文字）
- 夕方：「夏の夕暮れ、少し涼しくなってきましたね。今日もお疲れさまでした。」（37文字）
- 夜：「秋の夜、静かで穏やか。ゆっくりお休みください。明日も良い日に。」（35文字）

【避けるべき表現】
- 長い描写や説明
- 重厚で瞑想的な表現
- 指示的・説教的な内容
- 時間帯に合わない表現（夜なのに「朝」と言うなど）`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          temperature: 0.9, // 生成の創造性（0〜1、高いほど多様な表現に）
          maxOutputTokens: 2000, // 生成されるメッセージの最大長
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
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
      const cachedData: DailyMessagePayload = JSON.parse(cached);
      const cacheTtl = cachedData.cacheTtl ?? CACHE_TTL_SECONDS;
      const source = cachedData.source ?? 'gemini';
      return new Response(
        JSON.stringify(cachedData),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${cacheTtl}`,
            'X-Cache': 'HIT',
            'X-Message-Source': source,
          },
        }
      );
    }

    // Gemini APIキーを取得
    const apiKey = context.env.GEMINI_API_KEY;
    let message: string;
    let usedFallback = false;

    if (!apiKey) {
      console.error('[DAILY_MESSAGE] GEMINI_API_KEY is not configured. Using fallback message.');
      message = buildFallbackMessage(japanTime, dateDescription);
      usedFallback = true;
    } else {
      console.log('[DAILY_MESSAGE] GEMINI_API_KEY found, calling Gemini API...');
      try {
        // メッセージを生成
        message = await generateDailyMessage(apiKey, dateDescription);
        console.log('[DAILY_MESSAGE] Gemini API succeeded');
      } catch (error) {
        console.error('[DAILY_MESSAGE] Gemini API failed:', error);
        message = buildFallbackMessage(japanTime, dateDescription);
        usedFallback = true;
      }
    }

    const cacheTtl = usedFallback ? FALLBACK_CACHE_TTL_SECONDS : CACHE_TTL_SECONDS;

    // レスポンスデータを作成
    const responseData: DailyMessagePayload = {
      date: dateKey,
      dateDescription,
      message,
      generatedAt: new Date().toISOString(),
      source: usedFallback ? 'fallback' : 'gemini',
      cacheTtl,
    };

    // KVに保存（フォールバック時は短めのTTL）
    await context.env.DAILY_MESSAGE_CACHE.put(
      dateKey,
      JSON.stringify(responseData),
      { expirationTtl: cacheTtl }
    );

    // レスポンスを返す
    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${cacheTtl}`,
          'X-Cache': 'MISS',
          'X-Message-Source': responseData.source,
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
