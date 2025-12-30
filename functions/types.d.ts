/// <reference types="@cloudflare/workers-types" />

interface Env {
  GEMINI_API_KEY: string;
  DAILY_MESSAGE_CACHE: KVNamespace;
}

declare module "*.ts" {
  export const onRequest: (
    context: EventContext<Env, string, Record<string, unknown>>
  ) => Promise<Response>;
}
