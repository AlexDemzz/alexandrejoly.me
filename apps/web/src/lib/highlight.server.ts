import { createHighlighterCore } from "shiki/core";
import type { HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import vitesseDark from "shiki/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";

export type CodeLanguage = "bash" | "json" | "tsx";

// Workers cannot compile Oniguruma's WASM at runtime, so grammars run on the
// JavaScript regex engine.
let highlighter: Promise<HighlighterCore> | undefined;

const getHighlighter = () => {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [bash, json, tsx],
    themes: [vitesseLight, vitesseDark],
  });
  return highlighter;
};

/**
 * Both themes ride on CSS variables (`--shiki-light`, `--shiki-dark`) with no
 * inline colour, so the stylesheet picks one per colour scheme.
 */
export const highlight = async (code: string, lang: CodeLanguage) => {
  const shiki = await getHighlighter();
  return shiki.codeToHtml(code.trimEnd(), {
    defaultColor: false,
    lang,
    themes: { dark: "vitesse-dark", light: "vitesse-light" },
  });
};

const registrySources = import.meta.glob<string>("../../registry/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

const demoSources = import.meta.glob<string>("../components/demos/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1, -4);

const byFileName = (sources: Record<string, string>) =>
  new Map(
    Object.entries(sources).map(([path, source]) => [fileName(path), source])
  );

const REGISTRY_SOURCES = byFileName(registrySources);
const DEMO_SOURCES = byFileName(demoSources);

// Demos import from this repo's aliases; readers copy them into a default
// shadcn project.
const IMPORT_REWRITES: [string, string][] = [
  ["@registry/", "@/components/ui/"],
  ["@portfolio/ui/components/", "@/components/ui/"],
  ["@portfolio/ui/lib/utils", "@/lib/utils"],
];

const toProjectImports = (source: string) => {
  let code = source;
  for (const [from, to] of IMPORT_REWRITES) {
    code = code.replaceAll(`"${from}`, `"${to}`);
  }
  return code;
};

const required = (source: string | undefined, file: string) => {
  if (source === undefined) {
    throw new Error(`No source file named ${file}.tsx`);
  }
  return source;
};

export const registrySource = (name: string) =>
  required(REGISTRY_SOURCES.get(name), name);

export const demoSource = (file: string) =>
  toProjectImports(required(DEMO_SOURCES.get(file), file));
