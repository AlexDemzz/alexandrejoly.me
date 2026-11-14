// Screenshots the /og composition into public/og.png. Run it while the dev
// server is up: `pnpm dev`, then `pnpm og` in a second terminal.
import path from "node:path";

import { chromium } from "playwright";

const ORIGIN = process.env.OG_ORIGIN ?? "http://localhost:3003";
const out = path.join(import.meta.dirname, "../public/og.png");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: 630, width: 1200 },
  });
  await page.goto(`${ORIGIN}/og`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  console.log(`og.png: ${out}`);
} finally {
  await browser.close();
}
