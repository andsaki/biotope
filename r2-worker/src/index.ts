/* eslint-disable @typescript-eslint/no-explicit-any */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const objectName = url.pathname.slice(1);
    const object = await env.R2_BUCKET.get(objectName);

    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Content-Type",
      (object.httpMetadata as any)?.contentType || "application/octet-stream"
    );

    return new Response(object.body as any, { headers });
  },
};

interface Env {
  R2_BUCKET: any; // Temporarily using any to avoid type issues; ideally, use Cloudflare types
}
