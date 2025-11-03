/// <reference types="@cloudflare/workers-types" />

declare module "*.ts" {
  export const onRequest: (
    context: EventContext<Record<string, unknown>, string, Record<string, unknown>>
  ) => Promise<Response>;
}
