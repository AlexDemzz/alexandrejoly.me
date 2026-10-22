import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import type { Plugin } from "vitest/config";

import { componentCode } from "./plugins/component-code.ts";

const fromHere = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

// Vitest bundles a Vite without `resolve.tsconfigPaths`: mirror tsconfig.json.
export default defineConfig({
  // Vitest 3 types its plugins against Vite 7; the app's plugin runs on both.
  plugins: [componentCode() as unknown as Plugin],
  resolve: {
    alias: [
      {
        find: /^@\/components\/ui\//u,
        replacement: fromHere("../../packages/ui/src/components/"),
      },
      {
        find: /^@\/lib\/utils$/u,
        replacement: fromHere("../../packages/ui/src/lib/utils.ts"),
      },
      { find: /^@registry\//u, replacement: fromHere("registry/") },
      { find: /^@\//u, replacement: fromHere("src/") },
      {
        find: /^@portfolio\/ui\//u,
        replacement: fromHere("../../packages/ui/src/"),
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
