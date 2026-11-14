// Screenshots one bench demo: node scripts/bench-shot.mjs <port> <demo> [out.png]
// The bench must already be running on that port.
import { mkdirSync } from "node:fs";
import path from "node:path";

import { chromium } from "playwright";

const [
  port,
  demo,
  out = path.join(import.meta.dirname, "../bench/.shots", `${demo}.png`),
] = process.argv.slice(2);

if (!(port && demo)) {
  console.error("usage: bench-shot.mjs <port> <demo> [out.png]");
  process.exit(1);
}

mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  deviceScaleFactor: 2,
  viewport: { height: 900, width: 720 },
});
const issues = [];
page.on("console", (message) => {
  if (message.type() === "error" || message.type() === "warning") {
    issues.push(`${message.type()}: ${message.text()}`);
  }
});
page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));

await page.goto(`http://localhost:${port}/?demo=${demo}`);
await page.waitForSelector("[data-bench-demo]");
await page.waitForTimeout(300);
await page.locator("[data-bench]").screenshot({ path: out });
await browser.close();

console.log(out);
console.log(issues.length > 0 ? issues.join("\n") : "console: clean");
