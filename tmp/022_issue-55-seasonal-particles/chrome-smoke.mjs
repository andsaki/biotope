import fs from "node:fs";
import WebSocket from "ws";

const devtoolsBaseUrl = "http://127.0.0.1:9222";
const appUrl = "http://127.0.0.1:4173/";
const outputDir = "tmp/022_issue-55-seasonal-particles";

const pages = await (await fetch(`${devtoolsBaseUrl}/json/list`)).json();
const pageInfo = pages.find((page) => page.type === "page") ?? pages[0];

if (!pageInfo?.webSocketDebuggerUrl) {
  throw new Error("Chrome DevTools page target was not found");
}

const ws = new WebSocket(pageInfo.webSocketDebuggerUrl);
let commandId = 0;
const pending = new Map();
const events = [];

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) {
    events.push(message);
  }
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

const saveScreenshot = async (name) => {
  const response = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: 1280, height: 720, scale: 1 },
  });
  if (!response.result?.data) {
    throw new Error(`Screenshot failed: ${JSON.stringify(response)}`);
  }
  fs.writeFileSync(
    `${outputDir}/${name}.png`,
    Buffer.from(response.result.data, "base64")
  );
};

const waitForScene = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  for (let i = 0; i < 90; i += 1) {
    const response = await send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const text = document.body.textContent ?? "";
        return !text.includes("初期化中") &&
          !text.includes("3Dモデルを読み込み中") &&
          !text.includes("%");
      })()`,
    });
    if (response.result.result.value) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Page.bringToFront");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: appUrl });
const sceneLoaded = await waitForScene();

await saveScreenshot("spring-desktop");
const spring = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const canvas = document.querySelector("canvas");
    const loader = document.body.textContent?.match(/\\d+%|初期化中|読み込み中|完了/g) ?? [];
    return {
      title: document.title,
      canvas: { width: canvas?.width, height: canvas?.height },
      loader,
      bodyText: document.body.textContent?.slice(0, 300),
      buttons: [...document.querySelectorAll("button")].map((button) => button.textContent?.trim()).filter(Boolean),
    };
  })()`,
});

await send("Runtime.evaluate", {
  expression: `(() => {
    const openButton = [...document.querySelectorAll("button")].find((button) =>
      (button.getAttribute("aria-label") || "").includes("季節") ||
      button.textContent?.includes("春")
    );
    openButton?.click();
    setTimeout(() => {
      [...document.querySelectorAll("button")]
        .find((button) => button.textContent?.trim() === "冬")
        ?.click();
    }, 100);
  })()`,
});
await new Promise((resolve) => setTimeout(resolve, 1600));

await saveScreenshot("winter-desktop");
const winter = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const canvas = document.querySelector("canvas");
    const loader = document.body.textContent?.match(/\\d+%|初期化中|読み込み中|完了/g) ?? [];
    return {
      canvas: { width: canvas?.width, height: canvas?.height },
      loader,
      bodyText: document.body.textContent?.slice(0, 300),
      buttons: [...document.querySelectorAll("button")].map((button) => button.textContent?.trim()).filter(Boolean),
    };
  })()`,
});

console.log(JSON.stringify({
  sceneLoaded,
  spring: spring.result.result.value,
  winter: winter.result.result.value,
  events: events
    .filter((event) =>
      event.method === "Runtime.consoleAPICalled" ||
      event.method === "Runtime.exceptionThrown" ||
      event.method === "Log.entryAdded"
    )
    .slice(-10)
    .map((event) => ({
      method: event.method,
      type: event.params?.type,
      level: event.params?.entry?.level,
      text:
        event.params?.entry?.text ??
        event.params?.args?.map((arg) => arg.value).filter(Boolean).join(" "),
    })),
}, null, 2));

ws.close();
