import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The bench is a dev-only page that renders each component's demo on its own,
// with no site around it. Demos live in bench/demos/<component>.tsx.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/registry/formula": path.join(
        import.meta.dirname,
        "../registry/formula"
      ),
    },
  },
  root: import.meta.dirname,
});
