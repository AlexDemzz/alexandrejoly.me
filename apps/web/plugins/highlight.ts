import { createHighlighterCore } from "shiki/core";
import type { HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import vitesseDark from "shiki/themes/vitesse-dark.mjs";
import vitesseLight from "shiki/themes/vitesse-light.mjs";

import type {
  HighlightedCode,
  HighlightedToken,
} from "../src/lib/component-code.ts";

export type HighlightLang = "bash" | "css" | "json" | "tsx";

let highlighter: Promise<HighlighterCore> | undefined;

/**
 * Both themes ride on CSS variables (`--shiki-light`, `--shiki-dark`) with no
 * inline colour, so the code block picks one per colour scheme.
 */
export const highlight = async (
  source: string,
  lang: HighlightLang
): Promise<HighlightedCode> => {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [bash, css, json, tsx],
    themes: [vitesseLight, vitesseDark],
  });
  const shiki = await highlighter;
  const code = source.trimEnd();
  const { tokens } = shiki.codeToTokens(code, {
    defaultColor: false,
    lang,
    themes: { dark: "vitesse-dark", light: "vitesse-light" },
  });
  return {
    code,
    lines: tokens.map((line) =>
      line.map(({ content, htmlStyle }): HighlightedToken => [
        content,
        htmlStyle?.["--shiki-light"] ?? "",
        htmlStyle?.["--shiki-dark"] ?? "",
      ])
    ),
  };
};
