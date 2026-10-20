import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, shadcn],
  ignorePatterns: [...(core.ignorePatterns ?? []), ".claude/**"],
  jsPlugins: shadcn.jsPlugins,
  overrides: [
    {
      files: ["packages/ui/src/components/**"],
      // Vendored shadcn source: keep it diffable against the registry.
      rules: {
        "eslint/func-style": "off",
        "eslint/no-use-before-define": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "react/function-component-definition": "off",
        "import/consistent-type-specifier-style": "off",
        "shadcn/no-unknown-classes": ["error", { allow: ["cn-*", "toaster"] }],
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      files: ["apps/web/registry/**"],
      // Registry source is copied into consumers' projects: it follows shadcn's
      // style and restyles the official primitives it composes.
      rules: {
        "eslint/func-style": "off",
        "react/function-component-definition": "off",
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
      },
    },
  ],
});
