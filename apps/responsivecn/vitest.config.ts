import { fileURLToPath } from "node:url";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Standalone test config: jsdom + the `@` alias only. It deliberately skips the
// Cloudflare/TanStack Start build plugins so component tests run without the
// worker/SSR pipeline.
const src = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: { "@": src },
  },
  test: {
    environment: "jsdom",
  },
});
