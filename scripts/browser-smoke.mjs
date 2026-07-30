import { existsSync } from "node:fs";
import { chromium } from "playwright";

const DEFAULT_URL = "http://localhost:5173/";
const DEFAULT_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOAD_TIMEOUT_MS = 90_000;
const LOADER_FALLBACK_TIMEOUT_MS = 13_500;
const UI_TIMEOUT_MS = 15_000;

const url = process.env.SMOKE_URL ?? DEFAULT_URL;
const executablePath = process.env.CHROME_PATH ?? DEFAULT_CHROME_PATH;
const strict = process.env.SMOKE_STRICT === "1";

const launchOptions = existsSync(executablePath)
  ? { executablePath, headless: true }
  : { headless: true };

const isIgnoredNetworkUrl = (resourceUrl) => {
  const resource = new URL(resourceUrl, url);
  return resource.pathname === "/api/weather" || resource.pathname === "/api/daily-message";
};

let browser;

try {
  browser = await chromium.launch(launchOptions);
} catch (error) {
  if (strict) {
    throw error;
  }

  console.log(
    JSON.stringify({
      ok: true,
      skipped: true,
      reason: error instanceof Error ? error.message.split("\n")[0] : "browser launch failed",
    })
  );
  process.exit(0);
}

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleIssues = [];
const networkIssues = [];

page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  }
});

page.on("response", (response) => {
  if (response.status() < 400 || isIgnoredNetworkUrl(response.url())) {
    return;
  }

  networkIssues.push(`${response.status()} ${response.url()}`);
});

page.on("requestfailed", (request) => {
  if (isIgnoredNetworkUrl(request.url())) {
    return;
  }

  networkIssues.push(`${request.failure()?.errorText ?? "failed"} ${request.url()}`);
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("canvas", { timeout: LOAD_TIMEOUT_MS });
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector("canvas");
      return Boolean(canvas && canvas.width > 0 && canvas.height > 0);
    },
    undefined,
    { timeout: LOAD_TIMEOUT_MS }
  );
  await page.waitForTimeout(LOADER_FALLBACK_TIMEOUT_MS);
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      const hasUi =
        Boolean(document.querySelector('button[aria-label="UIパネルを開く"]')) ||
        Boolean(document.querySelector('button[aria-label="スクリーンショットを保存"]')) ||
        text.includes("UIパネルを開く") ||
        text.includes("最近の便り") ||
        text.includes("保存");
      return hasUi && !text.includes("読み込み中");
    },
    undefined,
    { timeout: LOAD_TIMEOUT_MS }
  );
  await page.waitForTimeout(1_000);

  const bodyText = await page.locator("body").innerText();
  const openPanelButton = page.getByRole("button", { name: "UIパネルを開く" });
  if (await openPanelButton.isVisible({ timeout: UI_TIMEOUT_MS }).catch(() => false)) {
    await openPanelButton.click();
  }

  await page
    .getByRole("button", { name: "スクリーンショットを保存" })
    .waitFor({ timeout: UI_TIMEOUT_MS });
  await page.locator("button", { hasText: "最近の便り" }).first().click();

  const filteredIssues = consoleIssues.filter(
    (issue) => !issue.includes("/api/weather") && !issue.includes("Failed to load resource")
  );

  if (bodyText.includes("読み込み中")) {
    throw new Error("ロード画面が残っています");
  }

  if (filteredIssues.length > 0) {
    throw new Error(`console warning/error: ${filteredIssues.join("\n")}`);
  }

  if (networkIssues.length > 0) {
    throw new Error(`network error: ${networkIssues.join("\n")}`);
  }

  console.log(
    JSON.stringify({
      ok: true,
      url,
      title: await page.title(),
    })
  );
} finally {
  await browser.close();
}
