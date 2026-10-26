import { createServerFn } from "@tanstack/react-start";
import type { Root } from "hast";

import { DIFF, HERO, SNIPPETS } from "@/components/landing/snippets";
import type { SnippetName } from "@/components/landing/snippets";
import { highlightLines } from "@/lib/highlight.server";

/** A snippet's source, for copying, and its highlighted lines. */
export interface HighlightedSnippet {
  code: string;
  lines: Root[];
}

/** Every landing code block, highlighted on the server. */
export const getLandingCode = createServerFn({ method: "GET" }).handler(
  async () => {
    const names = Object.keys(SNIPPETS) as SnippetName[];

    const [snippets, removed, added, caller, modal] = await Promise.all([
      Promise.all(
        names.map((name) =>
          highlightLines(SNIPPETS[name].code, SNIPPETS[name].lang)
        )
      ),
      highlightLines(DIFF.removed, "tsx"),
      highlightLines(DIFF.added, "tsx"),
      highlightLines(HERO.caller, "tsx"),
      highlightLines(HERO.modal, "tsx"),
    ]);

    return {
      snippets: Object.fromEntries(
        names.map((name, index) => [
          name,
          { code: SNIPPETS[name].code, lines: snippets[index] },
        ])
      ) as Record<SnippetName, HighlightedSnippet>,
      diff: { removed, added },
      hero: {
        caller: { code: HERO.caller, lines: caller },
        modal: { code: HERO.modal, lines: modal },
      },
    };
  }
);

export type LandingCode = Awaited<ReturnType<typeof getLandingCode>>;
