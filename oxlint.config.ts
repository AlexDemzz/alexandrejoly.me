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
    // Installed verbatim from that registry: its source is linted there.
    "apps/responsivecn/src/components/ui/{dialog-drawer,sheet-drawer,popover-drawer,tooltip-popover}.tsx",
    "apps/react-easy-modals/src/components/ui/modal.tsx",
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
      files: [
        "packages/ui/src/components/**",
        "apps/responsivecn/src/components/ui/**",
        "apps/react-easy-modals/src/components/ui/{button,dialog,item,scroll-area,tabs}.tsx",
      ],
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
      // Stock progress renders its track and indicator before declaring them.
      files: ["packages/ui/src/components/progress.tsx"],
      rules: { "eslint/no-use-before-define": "off" },
    },
    {
      // Stock BreadcrumbPage is a span with role="link" and aria-current="page".
      files: [
        "packages/ui/src/components/breadcrumb.tsx",
        "apps/responsivecn/src/components/ui/breadcrumb.tsx",
      ],
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
      files: [
        "packages/ui/src/components/code-block.tsx",
        "apps/responsivecn/src/components/ui/code-block.tsx",
      ],
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
      files: [
        "packages/ui/src/components/drawer.tsx",
        "apps/responsivecn/src/components/ui/drawer.tsx",
      ],
      rules: { "eslint/eqeqeq": "off", "eslint/no-eq-null": "off" },
    },
    {
      // responsivecn tests pass marker classNames to check where each one lands.
      files: [
        "apps/web/src/{dialog-drawer,sheet-drawer,popover-drawer,tooltip-popover}.test.tsx",
      ],
      rules: { "shadcn/no-restyle": "off", "shadcn/no-unknown-classes": "off" },
    },
    {
      // Stock shadcn item: ItemGroup is a div with role="list".
      files: [
        "packages/ui/src/components/item.tsx",
        "apps/react-easy-modals/src/components/ui/item.tsx",
      ],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Stock ButtonGroup is a div with role="group".
      files: ["apps/responsivecn/src/components/ui/button-group.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Stock ToggleGroup passes its variant props as a fresh context value.
      files: ["apps/responsivecn/src/components/ui/toggle-group.tsx"],
      rules: { "react/jsx-no-constructed-context-values": "off" },
    },
    {
      // Stock shadcn hooks and lib files, kept diffable against the registry.
      files: [
        "apps/responsivecn/src/hooks/{use-highlighted-code,use-mobile}.ts",
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
