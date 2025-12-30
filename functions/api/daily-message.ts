/**
 * Cloudflare Functions - 毎日のメッセージ生成API
 * Gemini APIを使用してその日の日付に関連したメッセージを生成
 */

/// <reference types="@cloudflare/workers-types" />

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

const FALLBACK_MESSAGES: Record<string, string[]> = {
  春: [
    '{date}は柔らかな風が背中を押してくれる日です。深呼吸して、小さな一歩を楽しんでくださいね。',
    '{date}の光は芽吹きをそっと照らしています。無理をせず、できるところから心を温めましょう。',
    '穏やかな{date}、香る花のようにあなたの笑顔も誰かを癒やしていますよ。',
    '芽吹きの気配が満ちる{date}、休むことも育つことだと空が教えてくれます。'
  ],
  夏: [
    '陽射しの力強さに包まれる{date}、冷たい飲み物でひと息つきながら自分を褒めてあげましょう。',
    '蝉の声が響く{date}は、立ち止まって空を見上げるだけでも気分が変わりますよ。',
    '汗ばむ{date}こそ、ゆっくり眠る時間を確保して体をいたわってくださいね。',
    'まっすぐな夏空が広がる{date}、あなたの努力も同じように澄んだ力を持っています。'
  ],
  秋: [
    '色づく風が頬をなでる{date}、深呼吸して心のノートをそっと整えてみませんか。',
    '実りの香りが漂う{date}、積み重ねてきたものを静かに確かめる時間にぴったりです。',
    '澄んだ空気の{date}は、温かい飲み物とともに自分への優しさを増やす日にしましょう。',
    '夕暮れが美しい{date}、ゆっくり歩くだけで気持ちも柔らかく解けていきます。'
  ],
  冬: [
    '凛とした空気の{date}、温かい湯気に包まれながら心までぬくもりを届けてあげてください。',
    '静かな{date}、小さな灯りをひとつともすように自分を労う言葉をかけましょう。',
    '白い息が踊る{date}は、厚手のマフラーのように優しさで身を包む日です。',
    '星が冴える{date}、今日もここまで来られたことをゆっくり褒めてあげてくださいね。'
  ],
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
 * Gemini APIが使えない場合のフォールバックメッセージ生成
 */
function buildFallbackMessage(date: Date, dateDescription: string): string {
  const season = getSeason(date.getMonth() + 1);
  const messages = FALLBACK_MESSAGES[season] ?? FALLBACK_MESSAGES['春'];
  const index = (date.getDate() - 1) % messages.length;
  return messages[index].replace('{date}', dateDescription);
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
