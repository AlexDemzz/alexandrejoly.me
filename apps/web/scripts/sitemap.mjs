// Writes public/sitemap.xml: the home page, the about, contact and privacy
// pages, the skill pages (SKILL_SNIPPETS in src/skill-snippets.ts), the lab,
// the components index, then one page per registry item documented here (see
// documented-items.mjs).
import { readFile, writeFile } from "node:fs/promises";

import { documentedItems } from "./documented-items.mjs";

const registry = JSON.parse(
  await readFile(new URL("../registry.json", import.meta.url), "utf-8")
);
const { origin } = new URL(registry.homepage);
const paths = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/skills/grokbot-notify",
  "/skills/design-to-shadcn",
  "/skills/shadcn-composition-patterns",
  "/lab",
  "/components",
  ...documentedItems(registry).map(({ name }) => `/components/${name}`),
];

const urls = paths
  .map((path) => `  <url>\n    <loc>${origin}${path}</loc>\n  </url>`)
  .join("\n");

await writeFile(
  new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);
