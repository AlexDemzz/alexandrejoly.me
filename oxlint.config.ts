import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, shadcn],
  ignorePatterns: [...(core.ignorePatterns ?? []), "apps/2018/**", "apps/2025/**"],
  jsPlugins: shadcn.jsPlugins,
  overrides: [
    {
      files: ["packages/ui/src/components/**"],
      rules: {
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
  ],
});
