import fs from "node:fs";
import WebSocket from "ws";

const devtoolsBaseUrl = "http://127.0.0.1:9222";
const appUrl = "http://127.0.0.1:4173/";
const outputDir = "temp/023_issue-53-how-to-play";

const pages = await (await fetch(`${devtoolsBaseUrl}/json/list`)).json();
const pageInfo = pages.find((page) => page.type === "page") ?? pages[0];

if (!pageInfo?.webSocketDebuggerUrl) {
  throw new Error("Chrome DevTools page target was not found");
}

const ws = new WebSocket(pageInfo.webSocketDebuggerUrl);
let commandId = 0;
const pending = new Map();

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
};

await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const message = { id: ++commandId, method, params };
    pending.set(message.id, resolve);
    ws.send(JSON.stringify(message));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: appUrl });
await new Promise((resolve) => setTimeout(resolve, 1000));
await send("Runtime.evaluate", {
  expression: `localStorage.clear(); sessionStorage.clear();`,
});
await send("Page.reload", { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 10000));

const result = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const bodyText = document.body.innerText || document.body.textContent || "";
    return {
      hasHowToPlay: bodyText.includes("遊び方"),
      hasOldHeading: bodyText.includes("はじめての歩き方"),
      bodyText: bodyText.slice(0, 500),
    };
  })()`,
});

const screenshot = await send("Page.captureScreenshot", {
  format: "png",
  clip: { x: 0, y: 0, width: 1280, height: 720, scale: 1 },
});

fs.writeFileSync(
  `${outputDir}/desktop.png`,
  Buffer.from(screenshot.result.data, "base64")
);

console.log(JSON.stringify(result.result.result.value, null, 2));
ws.close();
