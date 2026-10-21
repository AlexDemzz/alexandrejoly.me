import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const fromHere = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

// Vitest bundles a Vite without `resolve.tsconfigPaths`: mirror tsconfig.json.
export default defineConfig({
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
