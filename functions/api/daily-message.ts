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
      '瓶の内側に、花びらの影が一枚だけ貼りついていた。浅瀬ではまだ、誰かが通った波がほどけている。',
      '朝の水は薄く光り、岸の草だけが先に目を覚ましていた。蓋のすきまから、春の匂いが少し漏れる。'
    ],
    昼: [
      '昼の底で、小さな影が三度向きを変えた。読んだあと、蓮の葉の下を見ておくといい。',
      '紙の端に淡い緑のしみ。これはインクではなく、岸辺が今日こぼした記憶らしい。'
    ],
    夕方: [
      '夕方、花の影が水面より先に暗くなった。瓶はそれを見て、少しだけ岸へ寄った。',
      'この便りを閉じるころ、浅い波紋が一つ残る。春のものは、消える前に必ず明るくなる。'
    ],
    夜: [
      '夜の草むらで、まだ名前のない音が鳴っている。瓶はそれを聞き違えて、ここまで流れてきた。',
      '水面の黒いところに、小さな春が沈んでいる。光るものを追うなら、音を立てないこと。'
    ]
  },
  夏: {
    朝: [
      '朝の瓶は熱を持つ前に拾うといい。中の紙には、魚が避けた光の道筋が残っている。',
      '水面に早い夏が浮いていた。蓮の丸い影だけが、まだ夜を少し隠している。'
    ],
    昼: [
      '昼の水はまぶしすぎて、底のものを隠す。瓶の首に残った泡だけが、さっきの流れを覚えている。',
      '強い光の下で、魚影が一拍遅れて動いた。今日の合図は、明るい場所ではなく影に出る。'
    ],
    夕方: [
      '夕方、熱の抜けた風が瓶を半回転させた。紙の折り目は、岸ではなく水の中央を指している。',
      '蓮の葉が少しだけ遅れて揺れる。そこに今日の残り火がある、と瓶は言っている。'
    ],
    夜: [
      '夏の夜空に輝く星々が、水面にもいくつか落ちている。拾えるものと拾えないものを、瓶は区別しない。',
      '蛍の光が一つ、瓶の底で迷っていた。便りを閉じたら、その迷いが水辺へ戻る。'
    ]
  },
  秋: {
    朝: [
      '朝の水は澄んでいるのに、落ち葉の裏だけが暗い。瓶はそこを通って、少し冷たくなった。',
      '紙に薄い葉脈の跡。誰かが書いたのではなく、秋が押し花にした水面だ。'
    ],
    昼: [
      '昼の風が北へ変わると、瓶の中で小さな音がする。まだ見えていない岸が近い。',
      '落ち葉は流れているようで、同じ場所を何度も選ぶ。今日の便りもたぶんそうだ。'
    ],
    夕方: [
      '夕方の影が伸びると、葉の色だけが水に残る。瓶はその色を少し盗んできた。',
      '紙の端が乾いている。これは岸に近づいた証拠で、次の波でまた離れる証拠でもある。'
    ],
    夜: [
      '秋の夜は音が細い。瓶の口元で鳴る小さな虫の声だけが、まだ沈まない。',
      '暗い水面に葉が一枚、星のふりをしている。見破られても、たぶん動かない。'
    ]
  },
  冬: {
    朝: [
      '冬の朝、瓶のガラスは水より先に冷えた。紙には白い余白が多く、そこにだけ岸の音が残る。',
      '浅瀬の色が硬くなっている。魚は深く、便りだけが少し上に来た。'
    ],
    昼: [
      '昼の光は弱いが、底の青い粒を見せるには十分だった。瓶はそれを数え間違えている。',
      '冷たい水ほど、触れたあとの輪が長く残る。今日の便りはそのために閉じられていた。'
    ],
    夕方: [
      '夕方、岸の影が短く固まった。瓶の中では、まだほどけない波が一つだけ丸まっている。',
      '紙を傾けると、見えない雪の重さが移動する。読んだあと、水面は少し静かになる。'
    ],
    夜: [
      '冬の夜は、音より先に光が凍る。瓶の底の青だけが、まだ流れるふりをしている。',
      '暗い岸で、見落とされたものが少し白くなる。便りを閉じたら、その場所を探すといい。'
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
 * 時刻から時間帯を判定（英語）
 */
function getTimeOfDayEnglish(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
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
  const prompt = `あなたは静かな水辺の漂流瓶に入っている、少し不思議な観察記録を書く存在です。今日は${dateStr}です。

プレイヤーへの励ましではなく、このアプリ内の水辺で「何かが起きている」と感じる短い便りを書いてください。

【条件】
- 70-110文字以内（2〜3行程度）
- ${dateStr}の季節と時間帯（朝・昼・夕方・夜）を水面、蓮、魚影、風、泡、岸辺などで具体的に描く
- 「読んだあとに水辺で何かを見る/探す」気配を1つ入れる
- 少し怪しいが怖すぎない
- 人間への応援、説教、自己啓発、挨拶にしない
- です・ます調に寄せすぎず、観察メモのように書く
- メッセージのみを出力（説明や前置きは不要）

【良い例】
- 朝：「朝の水はまだ浅く眠っている。蓮の影だけが先に動いた。瓶を閉じたら、その下を見ておくといい。」
- 昼：「強い光で底は見えない。けれど泡は嘘をつかない。今日の流れは、魚影より少し遅れて来る。」
- 夕方：「夕方の風が瓶を半回転させた。紙の折り目は岸ではなく、水の中央を指している。」
- 夜：「夜の水面に、星ではない光が混じっている。触れると逃げるが、閉じると戻ってくる。」

【避けるべき表現】
- 今日も頑張って、素敵な1日、ゆっくり休んで、お疲れさま等の励まし
- 「あなた」「私」を中心にした文章
- 日記風の一般論
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
    const timeOfDay = getTimeOfDayEnglish(japanTime.getHours());
    const dateKey = `v2-${japanTime.getFullYear()}-${String(japanTime.getMonth() + 1).padStart(2, '0')}-${String(japanTime.getDate()).padStart(2, '0')}-${timeOfDay}`;
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
