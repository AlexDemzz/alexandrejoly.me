import { fileURLToPath } from "node:url";

import { runnerImport } from "vite";
import type { Plugin } from "vite";

import type { HighlightedCode } from "../src/lib/component-code.ts";
import type * as Snippets from "../src/skill-snippets.ts";
import { highlight } from "./highlight.ts";

const VIRTUAL_PREFIX = "virtual:skill-code/";
const RESOLVED_PREFIX = `\0${VIRTUAL_PREFIX}`;
const SNIPPETS_MODULE = fileURLToPath(
  new URL("../src/skill-snippets.ts", import.meta.url)
);

/**
 * Highlights a skill page's snippets at build time:
 * `virtual:skill-code/<name>` exports them keyed as in `src/skill-snippets.ts`.
 */
export const skillCode = (): Plugin => ({
  async load(id) {
    if (!id.startsWith(RESOLVED_PREFIX)) {
      return null;
    }
    const name = id.slice(RESOLVED_PREFIX.length) as Snippets.SkillPageName;
    const { module } = await runnerImport<typeof Snippets>(SNIPPETS_MODULE, {
      configFile: false,
    });
    this.addWatchFile(SNIPPETS_MODULE);
    const entries = await Promise.all(
      Object.entries(module.SKILL_SNIPPETS[name]).map(
        async ([key, { code, lang }]) =>
          [key, await highlight(code, lang)] as [string, HighlightedCode]
      )
    );
    return `export default ${JSON.stringify(Object.fromEntries(entries))};`;
  },
  name: "skill-code",
  resolveId(id) {
    return id.startsWith(VIRTUAL_PREFIX) ? `\0${id}` : null;
  },
});
