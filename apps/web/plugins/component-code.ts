import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { getConfig } from "@shadcn/registry/internal/get-config";
import { transformIcons } from "@shadcn/registry/internal/transformers/transform-icons";
import { runnerImport } from "vite";
import type { Plugin } from "vite";

import type {
  LAB_ITEM_USAGE,
  REGISTRY_USAGE,
} from "../src/components/docs/registry-usage.ts";
import type { ComponentCode, LabItemCode } from "../src/lib/component-code.ts";
import type * as Registry from "../src/lib/registry.ts";
import { highlight } from "./highlight.ts";

const VIRTUAL_PREFIX = "virtual:component-code/";
const RESOLVED_PREFIX = `\0${VIRTUAL_PREFIX}`;
const LAB_VIRTUAL_PREFIX = "virtual:lab-item-code/";
const LAB_RESOLVED_PREFIX = `\0${LAB_VIRTUAL_PREFIX}`;

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

// The source shows what `shadcn add` installs here: each `IconPlaceholder`
// becomes the icon of this site's `iconLibrary`.
const toInstalledSource = async (filename: string) => {
  const config = await getConfig(fromRoot("."));
  if (!config) {
    throw new Error("apps/web/components.json is missing");
  }
  const raw = readFileSync(filename, "utf-8");
  return await transformIcons(raw, { config, filename, raw });
};

const highlightOptional = (code: string | null, lang: "bash" | "css") =>
  code === null ? null : highlight(code, lang);

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
  installCommand: typeof Registry.installCommand;
  labRegistryName: typeof Registry.labRegistryName;
  labUsage: typeof LAB_ITEM_USAGE;
  usage: typeof REGISTRY_USAGE;
}

// Each runnerImport spins up its own Vite server: load both modules once, and
// again only after one of their files changes.
let docsModules: Promise<DocsModules> | undefined;
let docsDependencies = new Set<string>();

const loadDocsModules = async (): Promise<DocsModules> => {
  const [registry, usage] = await Promise.all([
    runnerImport<typeof Registry>(REGISTRY_MODULE, { configFile: false }),
    runnerImport<{
      LAB_ITEM_USAGE: typeof LAB_ITEM_USAGE;
      REGISTRY_USAGE: typeof REGISTRY_USAGE;
    }>(USAGE_MODULE, {
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
    installCommand: registry.module.installCommand,
    labRegistryName: registry.module.labRegistryName,
    labUsage: usage.module.LAB_ITEM_USAGE,
    usage: usage.module.REGISTRY_USAGE,
  };
};

const highlightDemos = (demos: string[]) =>
  Promise.all(
    demos.map(
      async (file) =>
        [
          file,
          await highlight(
            toProjectImports(readFileSync(demoPath(file), "utf-8")),
            "tsx"
          ),
        ] as const
    )
  );

const buildComponentCode = async (
  name: Registry.RegistryItemName
): Promise<{ code: ComponentCode; files: string[] }> => {
  docsModules ??= loadDocsModules();
  const docs = await docsModules;
  docsDependencies = docs.dependencies;
  const installation = docs.getInstallation(docs.getRegistryItem(name));
  const sourceFile = fromRoot(`registry/${name}.tsx`);
  const demos = demoFiles(name);
  const installedSource = await toInstalledSource(sourceFile);

  const [
    cli,
    dependencies,
    registryDependencies,
    styles,
    source,
    usageImports,
    usageMarkup,
    demoEntries,
  ] = await Promise.all([
    highlight(installation.cli, "bash"),
    highlightOptional(installation.dependencies, "bash"),
    highlightOptional(installation.registryDependencies, "bash"),
    highlightOptional(installation.styles, "css"),
    highlight(installedSource, "tsx"),
    highlight(docs.usage[name].imports, "tsx"),
    highlight(docs.usage[name].markup, "tsx"),
    highlightDemos(demos),
  ]);

  return {
    code: {
      demos: Object.fromEntries(demoEntries),
      installation: {
        cli,
        dependencies,
        registryDependencies,
        styles,
        targetPath: installation.targetPath,
      },
      source,
      usage: { imports: usageImports, markup: usageMarkup },
    },
    files: [...docs.dependencies, sourceFile, ...demos.map(demoPath)],
  };
};

const buildLabItemCode = async (
  name: Registry.LabItemName
): Promise<{ code: LabItemCode; files: string[] }> => {
  docsModules ??= loadDocsModules();
  const docs = await docsModules;
  docsDependencies = docs.dependencies;
  const demos = demoFiles(name);
  const [cli, usageImports, usageMarkup, demoEntries] = await Promise.all([
    highlight(docs.installCommand(docs.labRegistryName(name)), "bash"),
    highlight(docs.labUsage[name].imports, "tsx"),
    highlight(docs.labUsage[name].markup, "tsx"),
    highlightDemos(demos),
  ]);
  return {
    code: {
      cli,
      demos: Object.fromEntries(demoEntries),
      usage: { imports: usageImports, markup: usageMarkup },
    },
    files: [...docs.dependencies, ...demos.map(demoPath)],
  };
};

const ownerPrefixes = [RESOLVED_PREFIX, LAB_RESOLVED_PREFIX];

/**
 * Highlights every code block of a docs page at build time, so neither the
 * Worker nor the browser runs Shiki: `virtual:component-code/<name>` exports
 * that page's `ComponentCode`, and `virtual:lab-item-code/<name>` the
 * `LabItemCode` of an item documented on its lab page.
 */
export const componentCode = (): Plugin => ({
  // addWatchFile only covers demos that existed at load: a demo added or
  // removed later must rebuild its component's virtual module.
  configureServer(server) {
    const onDemoListChange = (file: string) => {
      if (!(file.startsWith(`${DEMOS_DIR}/`) && file.endsWith(".tsx"))) {
        return;
      }
      const demo = file.slice(DEMOS_DIR.length + 1);
      for (const environment of Object.values(server.environments)) {
        for (const [id, module] of environment.moduleGraph.idToModuleMap) {
          const prefix = ownerPrefixes.find((each) => id.startsWith(each));
          const isDemoOwner =
            prefix !== undefined &&
            demo.startsWith(`${id.slice(prefix.length)}-`);
          if (isDemoOwner) {
            environment.moduleGraph.invalidateModule(module);
          }
        }
      }
      server.ws.send({ type: "full-reload" });
    };
    server.watcher.on("add", onDemoListChange);
    server.watcher.on("unlink", onDemoListChange);
  },
  async load(id) {
    if (id.startsWith(LAB_RESOLVED_PREFIX)) {
      const name = id.slice(LAB_RESOLVED_PREFIX.length) as Registry.LabItemName;
      const { code, files } = await buildLabItemCode(name);
      for (const file of files) {
        this.addWatchFile(file);
      }
      return `export default ${JSON.stringify(code)};`;
    }
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
    return id.startsWith(VIRTUAL_PREFIX) || id.startsWith(LAB_VIRTUAL_PREFIX)
      ? `\0${id}`
      : null;
  },
});
