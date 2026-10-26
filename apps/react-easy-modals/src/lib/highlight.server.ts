import { getHighlighter } from "fumadocs-core/highlight";
import type { Element, Root, RootContent } from "hast";

import { SHIKI_OPTIONS } from "./shiki";

export type CodeLanguage = "bash" | "tsx";

// Fumadocs' Shiki on the JavaScript regex engine: Workers cannot compile
// Oniguruma's WASM at runtime.
const getShiki = () =>
  getHighlighter("js", {
    langs: ["bash", "tsx"],
    themes: Object.values(SHIKI_OPTIONS.themes),
  });

/** The same markup as the docs' MDX code blocks, as a hast tree. */
export const highlight = async (code: string, lang: CodeLanguage) => {
  const shiki = await getShiki();
  return shiki.codeToHast(code.trimEnd(), { ...SHIKI_OPTIONS, lang });
};

const childElements = (
  { children }: { children: RootContent[] },
  tagName: string
) =>
  children.filter(
    (child): child is Element =>
      child.type === "element" && child.tagName === tagName
  );

/**
 * The content of each line, highlighted as one snippet so the grammar keeps
 * its context across lines. Render them inside a `pre.shiki`.
 */
export const highlightLines = async (
  code: string,
  lang: CodeLanguage
): Promise<Root[]> => {
  const tree = await highlight(code, lang);
  const lines = childElements(tree, "pre")
    .flatMap((pre) => childElements(pre, "code"))
    .flatMap((element) => childElements(element, "span"));
  return lines.map((line) => ({ type: "root", children: line.children }));
};
