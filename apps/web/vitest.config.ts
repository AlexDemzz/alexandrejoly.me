import { defineConfig } from "vitest/config";

import { componentCode } from "./plugins/component-code.ts";

export default defineConfig({
  plugins: [componentCode()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
