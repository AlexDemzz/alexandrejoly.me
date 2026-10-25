// Writes public/og/components/<name>.png for every registry item documented
// here (see documented-items.mjs) whose card changed: its title, description,
// row icon or the card itself, and public/og/components.png for the index,
// whose card shows every row icon.
// Hashes of those inputs live in og-images.lock.json; a run with nothing stale
// starts nothing. `--force` redraws every card. Stale cards are screenshotted
// from a dev server's /og/components/<name> and /og/components in a light
// colour scheme.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

import { documentedItems } from "./documented-items.mjs";

const PORT = 3099;
const ORIGIN = `http://localhost:${PORT}`;
const READY_TIMEOUT_MS = 60_000;
const OUT_DIR = new URL("../public/og/", import.meta.url);
const INDEX = "components";
const LOCK = new URL("og-images.lock.json", import.meta.url);
const CARD = new URL("../src/components/og-card.tsx", import.meta.url);

const read = (url) => readFile(url, "utf-8");
const readJson = async (url) => JSON.parse(await read(url));

const registry = await readJson(new URL("../registry.json", import.meta.url));
const items = documentedItems(registry);
const card = await read(CARD);
const previous = existsSync(LOCK) ? await readJson(LOCK) : {};

const iconSource = async (name) => {
  const icon = new URL(`../src/components/${name}-icon.tsx`, import.meta.url);
  if (!existsSync(icon)) {
    throw new Error(`No row icon at src/components/${name}-icon.tsx`);
  }
  return await read(icon);
};

const hash = (inputs) =>
  createHash("sha256").update(JSON.stringify(inputs)).digest("hex");

const icons = Object.fromEntries(
  await Promise.all(
    items.map(async ({ name }) => [name, await iconSource(name)])
  )
);

const hashes = {
  ...Object.fromEntries(
    items.map(({ description, name, title }) => [
      name,
      hash([title, description, icons[name], card]),
    ])
  ),
  [INDEX]: hash([Object.entries(icons), card]),
};

/** Where each card is served, and where its PNG goes under public/og/. */
const target = (key) =>
  key === INDEX
    ? { file: `${INDEX}.png`, path: `/og/${INDEX}` }
    : { file: `components/${key}.png`, path: `/og/components/${key}` };

const force = process.argv.includes("--force");
const stale = Object.keys(hashes).filter(
  (key) =>
    force ||
    previous[key] !== hashes[key] ||
    !existsSync(new URL(target(key).file, OUT_DIR))
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

const capture = async (keys) => {
  const { chromium } = await import("playwright");
  const server = spawn(
    "pnpm",
    ["exec", "vite", "dev", "--port", String(PORT), "--strictPort"],
    { cwd: new URL("..", import.meta.url), stdio: "ignore" }
  );
  try {
    await waitForServer();
    await mkdir(new URL("components/", OUT_DIR), { recursive: true });
    const browser = await chromium.launch();
    const context = await browser.newContext({
      colorScheme: "light",
      reducedMotion: "reduce",
      viewport: { height: 630, width: 1200 },
    });
    await Promise.all(
      keys.map(async (key) => {
        const { file, path } = target(key);
        const page = await context.newPage();
        await page.goto(`${ORIGIN}${path}`, { waitUntil: "networkidle" });
        await page.locator("[data-og-card]").screenshot({
          animations: "disabled",
          path: new URL(file, OUT_DIR).pathname,
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
