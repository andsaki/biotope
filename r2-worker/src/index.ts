export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const objectName = decodeURIComponent(url.pathname.slice(1));

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    if (objectName === "") {
      return new Response(
        "Welcome to Biotope R2 Worker. Please specify an asset path to access files.",
        { status: 200, headers: corsHeaders }
      );
    }

    // 日付ベースのキャッシュキーを作成（同じ日は同じ内容を返す）
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    const cacheKey = new URL(`https://cache.biotope/${objectName}?date=${today}`, request.url);
    const cache = caches.default;

    // まずキャッシュから取得を試みる
    let response = await cache.match(cacheKey);

    if (!response) {
      // キャッシュミス - R2から取得
      const object = await env.R2_BUCKET.get(objectName);

      if (object === null) {
        return new Response(`Object Not Found: ${objectName}`, {
          status: 404,
          headers: corsHeaders
        });
      }

      const headers = new Headers(corsHeaders);
      headers.set(
        "Content-Type",
        object.httpMetadata?.contentType || "application/octet-stream"
      );
      // 24時間キャッシュ
      headers.set("Cache-Control", "public, max-age=86400");

      response = new Response(object.body, { headers });

      // キャッシュに保存
      await cache.put(cacheKey, response.clone());
    }

    return response;
  },
};

interface Env {
  R2_BUCKET: R2Bucket;
}

// Cloudflare Workers用の型定義
declare const caches: {
  default: Cache;
};

interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
}

interface R2Object {
  body: ReadableStream;
  httpMetadata?: {
    contentType?: string;
  };
}
