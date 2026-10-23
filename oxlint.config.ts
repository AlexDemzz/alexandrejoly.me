import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";

export default defineConfig({
  extends: [core, react, tanstack, shadcn],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ".claude/**",
    // Registry source ships verbatim to installs: no lint directives in it.
    "apps/web/registry/**",
  ],
  jsPlugins: shadcn.jsPlugins,
  overrides: [
    {
      files: ["packages/ui/src/components/**"],
      // Vendored shadcn source: keep it diffable against the registry.
      rules: {
        "eslint/func-style": "off",
        "react/function-component-definition": "off",
        "import/consistent-type-specifier-style": "off",
        "shadcn/no-unknown-classes": ["error", { allow: ["cn-*", "toaster"] }],
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      // Stock progress renders its track and indicator before declaring them.
      files: ["packages/ui/src/components/progress.tsx"],
      rules: { "eslint/no-use-before-define": "off" },
    },
    {
      // Stock spinner is an svg with role="status"; <output> cannot replace it.
      files: ["packages/ui/src/components/spinner.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Stock shadcn code block: a focusable <pre> so keyboard users can
      // scroll it, a promise-chained copy and a counter-reset style.
      files: ["packages/ui/src/components/code-block.tsx"],
      rules: {
        "eslint/no-empty-function": "off",
        "eslint/no-use-before-define": "off",
        "eslint/require-unicode-regexp": "off",
        "jsx-a11y/no-noninteractive-tabindex": "off",
        "promise/prefer-await-to-then": "off",
        "shadcn/no-inline-styles": "off",
      },
    },
    {
      // InfiniteScrollViewport renders a div, so a <section> cannot replace
      // the region role its keyboard-scrollable viewport needs.
      files: ["apps/web/src/components/demos/infinite-scroll-*.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Stock shadcn item: ItemGroup is a div with role="list".
      files: ["packages/ui/src/components/item.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
  ],
});
