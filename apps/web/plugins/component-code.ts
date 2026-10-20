import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createHighlighterCore } from "shiki/core";
import type { HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import tsx from "shiki/langs/tsx.mjs";
import vitesseDark from "shiki/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";
import { runnerImport } from "vite";
import type { Plugin } from "vite";

import type { REGISTRY_USAGE } from "../src/components/docs/registry-usage.ts";
import type { ComponentCode } from "../src/lib/component-code.ts";
import type * as Registry from "../src/lib/registry.ts";

const VIRTUAL_PREFIX = "virtual:component-code/";
const RESOLVED_PREFIX = `\0${VIRTUAL_PREFIX}`;

const fromRoot = (path: string) =>
  fileURLToPath(new URL(`../${path}`, import.meta.url));

const DEMOS_DIR = fromRoot("src/components/demos");
const REGISTRY_MODULE = fromRoot("src/lib/registry.ts");
const USAGE_MODULE = fromRoot("src/components/docs/registry-usage.ts");

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

let highlighter: Promise<HighlighterCore> | undefined;

/**
 * Both themes ride on CSS variables (`--shiki-light`, `--shiki-dark`) with no
 * inline colour, so the stylesheet picks one per colour scheme.
 */
const highlight = async (code: string, lang: "bash" | "tsx") => {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [bash, tsx],
    themes: [vitesseLight, vitesseDark],
  });
  const shiki = await highlighter;
  return shiki.codeToHtml(code.trimEnd(), {
    defaultColor: false,
    lang,
    themes: { dark: "vitesse-dark", light: "vitesse-light" },
  });
};

const highlightOptional = (code: string | null) =>
  code === null ? null : highlight(code, "bash");

const demoPath = (file: string) => `${DEMOS_DIR}/${file}.tsx`;

/** A component's demos are the files named after it: `<name>-*.tsx`. */
const demoFiles = (name: string) =>
  readdirSync(DEMOS_DIR)
    .filter((file) => file.startsWith(`${name}-`) && file.endsWith(".tsx"))
    .map((file) => file.slice(0, -".tsx".length));

interface DocsModules {
  dependencies: Set<string>;
  getInstallation: typeof Registry.getInstallation;
  getRegistryItem: typeof Registry.getRegistryItem;
  usage: typeof REGISTRY_USAGE;
}

// Each runnerImport spins up its own Vite server: load both modules once, and
// again only after one of their files changes.
let docsModules: Promise<DocsModules> | undefined;
let docsDependencies = new Set<string>();

const loadDocsModules = async (): Promise<DocsModules> => {
  const [registry, usage] = await Promise.all([
    runnerImport<typeof Registry>(REGISTRY_MODULE, { configFile: false }),
    runnerImport<{ REGISTRY_USAGE: typeof REGISTRY_USAGE }>(USAGE_MODULE, {
      configFile: false,
      resolve: { tsconfigPaths: true },
    }),
  ]);
  return {
    dependencies: new Set([
      REGISTRY_MODULE,
      USAGE_MODULE,
      ...registry.dependencies,
      ...usage.dependencies,
    ]),
    getInstallation: registry.module.getInstallation,
    getRegistryItem: registry.module.getRegistryItem,
    usage: usage.module.REGISTRY_USAGE,
  };
};

const buildComponentCode = async (
  name: Registry.RegistryItemName
): Promise<{ code: ComponentCode; files: string[] }> => {
  docsModules ??= loadDocsModules();
  const docs = await docsModules;
  docsDependencies = docs.dependencies;
  const installation = docs.getInstallation(docs.getRegistryItem(name));
  const sourceFile = fromRoot(`registry/${name}.tsx`);
  const demos = demoFiles(name);

  const [cli, dependencies, registryDependencies, source, usageHtml, ...html] =
    await Promise.all([
      highlight(installation.cli, "bash"),
      highlightOptional(installation.dependencies),
      highlightOptional(installation.registryDependencies),
      highlight(readFileSync(sourceFile, "utf-8"), "tsx"),
      highlight(docs.usage[name], "tsx"),
      ...demos.map((file) =>
        highlight(
          toProjectImports(readFileSync(demoPath(file), "utf-8")),
          "tsx"
        )
      ),
    ]);

  return {
    code: {
      demos: Object.fromEntries(
        demos.map((file, index) => [file, html[index] ?? ""])
      ),
      installation: {
        cli,
        dependencies,
        registryDependencies,
        targetPath: installation.targetPath,
      },
      source,
      usage: usageHtml,
    },
    files: [...docs.dependencies, sourceFile, ...demos.map(demoPath)],
  };
};

/**
 * Highlights every code block of a docs page at build time, so neither the
 * Worker nor the browser runs Shiki: `virtual:component-code/<name>` exports
 * that page's `ComponentCode`.
 */
export const componentCode = (): Plugin => ({
  async load(id) {
    if (!id.startsWith(RESOLVED_PREFIX)) {
      return null;
    }
    const name = id.slice(RESOLVED_PREFIX.length) as Registry.RegistryItemName;
    const { code, files } = await buildComponentCode(name);
    for (const file of files) {
      this.addWatchFile(file);
    }
    return `export default ${JSON.stringify(code)};`;
  },
  name: "component-code",
  watchChange(id) {
    if (docsDependencies.has(id)) {
      docsModules = undefined;
    }
  },
  resolveId(id) {
    return id.startsWith(VIRTUAL_PREFIX) ? `\0${id}` : null;
  },
});
