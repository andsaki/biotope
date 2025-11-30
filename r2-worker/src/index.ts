/* eslint-disable @typescript-eslint/no-explicit-any */
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
      (object.httpMetadata as any)?.contentType || "application/octet-stream"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body as any, { headers });
  },
};

interface Env {
  R2_BUCKET: any; // Temporarily using any to avoid type issues; ideally, use Cloudflare types
}
