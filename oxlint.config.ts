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
      // Fumadocs typography opts a subtree out of prose with this marker
      // class; it has no CSS of its own.
      files: ["apps/responsivecn/**", "apps/react-easy-modals/**"],
      rules: {
        "shadcn/no-unknown-classes": ["error", { allow: ["not-prose"] }],
      },
    },
    {
      files: ["packages/ui/src/components/**"],
      // Vendored shadcn source: keep it diffable against the registry.
      rules: {
        "eslint/func-style": "off",
        "react/function-component-definition": "off",
        "import/consistent-type-specifier-style": "off",
        "shadcn/no-unknown-classes": [
          "error",
          { allow: ["cn-*", "toaster", "not-prose"] },
        ],
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
    {
      // Registry items whose source lives here: apps/web/public/r ships each
      // file as written, so a fix changes every install. Kept in the stock
      // shadcn style of the other registry items.
      files: [
        "packages/ui/src/components/{dialog-drawer,sheet-drawer,popover-drawer,modal}.tsx",
      ],
      rules: {
        "eslint/curly": "off",
        "eslint/eqeqeq": "off",
        "eslint/no-eq-null": "off",
        "promise/prefer-await-to-callbacks": "off",
        "react/no-clone-element": "off",
        "typescript/consistent-type-definitions": "off",
        "typescript/no-dynamic-delete": "off",
        "unicorn/consistent-function-scoping": "off",
        "unicorn/no-useless-undefined": "off",
      },
    },
    {
      // Stock progress renders its track and indicator before declaring them.
      files: ["packages/ui/src/components/progress.tsx"],
      rules: { "eslint/no-use-before-define": "off" },
    },
    {
      // Stock BreadcrumbPage is a span with role="link" and aria-current="page".
      files: ["packages/ui/src/components/breadcrumb.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
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
      // Stock shadcn drawer: `snapPoints != null` checks null and undefined.
      files: ["packages/ui/src/components/drawer.tsx"],
      rules: { "eslint/eqeqeq": "off", "eslint/no-eq-null": "off" },
    },
    {
      // responsivecn tests pass marker classNames to check where each one lands.
      files: [
        "apps/web/src/{dialog-drawer,sheet-drawer,popover-drawer}.test.tsx",
      ],
      rules: { "shadcn/no-restyle": "off", "shadcn/no-unknown-classes": "off" },
    },
    {
      // Stock shadcn item: ItemGroup is a div with role="list".
      files: ["packages/ui/src/components/item.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Stock ToggleGroup passes its variant props as a fresh context value
      // and imports VariantProps with an inline type specifier.
      files: ["packages/ui/src/components/toggle-group.tsx"],
      rules: {
        "react/jsx-no-constructed-context-values": "off",
        "typescript/no-import-type-side-effects": "off",
      },
    },
    {
      // Stock shadcn hooks and lib files, kept diffable against the registry.
      files: [
        "apps/responsivecn/src/hooks/use-highlighted-code.ts",
        "apps/responsivecn/src/lib/highlighter.tsx",
      ],
      rules: {
        "eslint/func-style": "off",
        "eslint/no-empty-function": "off",
        "eslint/no-shadow": "off",
        "promise/prefer-await-to-then": "off",
        "react/set-state-in-effect": "off",
        "shadcn/no-inline-styles": "off",
      },
    },
    {
      // react-easy-modals opens a prototype-less function (an arrow) as a lazy
      // import, so the modal components it opens are function declarations.
      files: [
        "apps/react-easy-modals/src/components/{action-modal,css-modal,stack-modal}.tsx",
        "apps/react-easy-modals/src/components/landing/{demos,hero-demo}.tsx",
        "apps/react-easy-modals/src/components/modals/{confirm-exemple,nested-exemple,prevent-close-exemple,registry-modal-example,registry-nested-example,transition-exemple}.tsx",
      ],
      rules: {
        "eslint/func-style": "off",
        "react/function-component-definition": "off",
      },
    },
    {
      // The demo modal parts are kept as written in the react-easy-modals
      // docs: function declarations, and a div that only reads as a dialog.
      files: ["apps/react-easy-modals/src/components/demo-modal.tsx"],
      rules: {
        "eslint/func-style": "off",
        "jsx-a11y/prefer-tag-over-role": "off",
        "react/function-component-definition": "off",
      },
    },
    {
      // The playground frames its own same-origin /preview route, whose module
      // scripts and storage need that origin.
      files: ["apps/responsivecn/src/components/create/playground.tsx"],
      rules: { "react/iframe-missing-sandbox": "off" },
    },
  ],
});
