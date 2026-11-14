// Assembles registry.json from one file per item, so adding a component never
// edits a shared file. The theme item comes first; the rest sort by name.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const itemsDir = path.join(root, "registry/items");
const THEME_ITEM = "formula";

const items = readdirSync(itemsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(itemsDir, file), "utf-8")))
  .toSorted((a, b) => {
    if (a.name === THEME_ITEM) {
      return -1;
    }
    if (b.name === THEME_ITEM) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage: "https://formula2030.alexandrejoly.me",
  items,
  name: "formula2030",
};

writeFileSync(
  path.join(root, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`
);
console.log(`registry.json: ${items.length} items`);
