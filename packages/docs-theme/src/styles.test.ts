import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";
import type { Root } from "postcss";
import { expect, it } from "vitest";

const stylesPath = fileURLToPath(new URL("styles.css", import.meta.url));

const compile = async (candidate: string) => {
  const input = `@import "./styles.css";\n@source inline("${candidate}");`;
  const result = await postcss([tailwindcss()]).process(input, {
    from: stylesPath,
  });
  return result.root;
};

const selectorsIn = (root: Root, media: string) => {
  const selectors: string[] = [];
  root.walkAtRules("media", (atRule) => {
    if (atRule.params === media) {
      atRule.walkRules((rule) => {
        selectors.push(rule.selector);
      });
    }
  });
  return selectors;
};

it("scopes the dark variant to the system preference", async () => {
  const root = await compile("dark:bg-fd-muted");

  expect(selectorsIn(root, "(prefers-color-scheme: dark)")).toContain(
    String.raw`.dark\:bg-fd-muted`
  );
});
