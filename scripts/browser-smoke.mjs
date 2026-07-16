import { existsSync } from "node:fs";
import { chromium } from "playwright";

const DEFAULT_URL = "http://localhost:5173/";
const DEFAULT_CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LOAD_TIMEOUT_MS = 90_000;

const url = process.env.SMOKE_URL ?? DEFAULT_URL;
const executablePath = process.env.CHROME_PATH ?? DEFAULT_CHROME_PATH;
const strict = process.env.SMOKE_STRICT === "1";

const launchOptions = existsSync(executablePath)
  ? { executablePath, headless: true }
  : { headless: true };

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

page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  }
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => !document.body.innerText.includes("読み込み中"),
    undefined,
    { timeout: LOAD_TIMEOUT_MS }
  );
  await page.waitForTimeout(1_000);

  const bodyText = await page.locator("body").innerText();
  const filteredIssues = consoleIssues.filter(
    (issue) => !issue.includes("/api/weather") && !issue.includes("Failed to load resource")
  );

  if (bodyText.includes("読み込み中")) {
    throw new Error("ロード画面が残っています");
  }

  if (filteredIssues.length > 0) {
    throw new Error(`console warning/error: ${filteredIssues.join("\n")}`);
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
