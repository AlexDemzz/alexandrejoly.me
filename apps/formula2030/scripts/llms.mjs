// Writes public/llms.txt from the registry item files, so the index for
// coding agents always lists exactly what the registry serves.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = "https://formula2030.alexandrejoly.me";
const THEME_ITEM = "formula";

const app = path.join(import.meta.dirname, "..");
const itemsDir = path.join(app, "../../packages/formula2030/registry/items");

const items = readdirSync(itemsDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => JSON.parse(readFileSync(path.join(itemsDir, file), "utf-8")))
  .toSorted((a, b) => a.name.localeCompare(b.name));

const theme = items.find((item) => item.name === THEME_ITEM);
const components = items.filter((item) => item.name !== THEME_ITEM);

const REGISTER_LABELS = {
  all: "Every register",
  machined: "Machined register",
  readout: "Readout register",
  strata: "Strata register",
};

const line = (item) => {
  const register = REGISTER_LABELS[item.meta?.register] ?? "Theme";
  return `- [${item.name}](${SITE_URL}/r/${item.name}.json): ${register}. ${item.description}`;
};

const text = `# Formula 2030

> A shadcn registry of themed components for UI SDK (@ui-sdk/react). Every control is a UI SDK component underneath, styled through its data-slot and state attributes. The look comes from a concept-car control panel.

Registry: ${SITE_URL}/r/registry.json

Files install into components/ui/formula/, so the theme adds to an existing shadcn project without replacing its components. Add one item with:

    npx shadcn@latest add ${SITE_URL}/r/<name>.json

Each component is drawn in one register: readout measures a value (black glass, tick scales, a square marker), strata chooses one state among a few (tonal bands stepping dark to light), machined actuates something (tiles, metal knobs, keys that sink). Global CSS needs \`@layer ui-sdk;\` declared above \`@import "tailwindcss"\`.

## Components

${components.map(line).join("\n")}
${theme ? `\n## Theme\n\n${line(theme)}\n` : ""}`;

mkdirSync(path.join(app, "public"), { recursive: true });
writeFileSync(path.join(app, "public/llms.txt"), text);
console.log(`llms.txt: ${items.length} items`);
