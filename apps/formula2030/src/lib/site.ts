export const SITE_URL = "https://formula2030.alexandrejoly.me";
export const SITE_NAME = "Formula 2030";
export const SITE_TITLE =
  "Formula 2030, a UI SDK theme from a concept-car panel";
export const SITE_DESCRIPTION =
  "Themed components for UI SDK, installable from a shadcn registry. Every control is a UI SDK component underneath, drawn in black glass, tonal bands and machined tiles.";
export const REGISTRY_URL = `${SITE_URL}/r/registry.json`;
export const AUTHOR_URL = "https://alexandrejoly.me";
export const UI_SDK_URL = "https://ui-sdk.dev";
export const SOURCE_URL = "https://github.com/AlexDemzz/alexandrejoly.me";
export const THEME_COLOR = "#dfe3e9";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

export const itemUrl = (name: string) => `${SITE_URL}/r/${name}.json`;

export const installCommand = (name: string) =>
  `npx shadcn@latest add ${itemUrl(name)}`;

export const AGENT_PROMPT = `Install components from the Formula 2030 shadcn registry, ${REGISTRY_URL}. They are built on UI SDK (@ui-sdk/react) and install into components/ui/formula.`;
