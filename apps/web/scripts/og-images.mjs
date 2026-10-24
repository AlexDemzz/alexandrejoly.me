// Writes public/og/components/<name>.png for every registry item whose card
// changed: its title, description, row icon or the card itself. Hashes of those
// inputs live in og-images.lock.json; a run with nothing stale starts nothing.
// `--force` redraws every card. Stale cards are screenshotted from a dev
// server's /og/components/<name> in a light colour scheme.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 3099;
const ORIGIN = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 60_000;
const OUT_DIR = new URL("../public/og/components/", import.meta.url);
const LOCK = new URL("og-images.lock.json", import.meta.url);
const CARD = new URL("../src/components/og-card.tsx", import.meta.url);

const read = (url) => readFile(url, "utf-8");
const readJson = async (url) => JSON.parse(await read(url));

const registry = await readJson(new URL("../registry.json", import.meta.url));
const card = await read(CARD);
const previous = existsSync(LOCK) ? await readJson(LOCK) : {};

const iconSource = async (name) => {
  const icon = new URL(`../src/components/${name}-icon.tsx`, import.meta.url);
  if (!existsSync(icon)) {
    throw new Error(`No row icon at src/components/${name}-icon.tsx`);
  }
  return await read(icon);
};

const hashes = Object.fromEntries(
  await Promise.all(
    registry.items.map(async ({ description, name, title }) => [
      name,
      createHash("sha256")
        .update(
          JSON.stringify([title, description, await iconSource(name), card])
        )
        .digest("hex"),
    ])
  )
);

const force = process.argv.includes("--force");
const stale = registry.items
  .map(({ name }) => name)
  .filter(
    (name) =>
      force ||
      previous[name] !== hashes[name] ||
      !existsSync(new URL(`${name}.png`, OUT_DIR))
  );

const waitForServer = async (deadline = Date.now() + READY_TIMEOUT_MS) => {
  try {
    await fetch(ORIGIN);
  } catch {
    if (Date.now() > deadline) {
      throw new Error(`Dev server did not answer on ${ORIGIN}`);
    }
    await delay(500);
    await waitForServer(deadline);
  }
};

const capture = async (names) => {
  const { chromium } = await import("playwright");
  const server = spawn(
    "pnpm",
    ["exec", "vite", "dev", "--port", String(PORT), "--strictPort"],
    { cwd: new URL("..", import.meta.url), stdio: "ignore" }
  );
  try {
    await waitForServer();
    await mkdir(OUT_DIR, { recursive: true });
    const browser = await chromium.launch();
    const context = await browser.newContext({
      colorScheme: "light",
      reducedMotion: "reduce",
      viewport: { height: 630, width: 1200 },
    });
    await Promise.all(
      names.map(async (name) => {
        const page = await context.newPage();
        await page.goto(`${ORIGIN}/og/components/${name}`, {
          waitUntil: "networkidle",
        });
        await page.locator("[data-og-card]").screenshot({
          animations: "disabled",
          path: new URL(`${name}.png`, OUT_DIR).pathname,
        });
      })
    );
    await browser.close();
  } finally {
    server.kill();
  }
};

if (stale.length === 0) {
  console.log("OG images up to date");
} else {
  await capture(stale);
  await writeFile(LOCK, `${JSON.stringify(hashes, null, 2)}\n`);
  console.log(`OG images redrawn: ${stale.join(", ")}`);
}
