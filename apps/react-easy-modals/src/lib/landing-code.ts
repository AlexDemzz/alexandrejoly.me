import { createServerFn } from "@tanstack/react-start";
import type { Root } from "hast";

import {
  DIFF,
  HERO,
  HERO_ANSWERS,
  heroAnswerComment,
  SNIPPETS,
} from "@/components/landing/snippets";
import type { HeroAnswer, SnippetName } from "@/components/landing/snippets";
import { highlightLines } from "@/lib/highlight.server";

const EMPTY_LINE: Root = { type: "root", children: [] };

/** A snippet's source, for copying, and its highlighted lines. */
export interface HighlightedSnippet {
  code: string;
  lines: Root[];
}

/** Every landing code block, highlighted on the server. */
export const getLandingCode = createServerFn({ method: "GET" }).handler(
  async () => {
    const names = Object.keys(SNIPPETS) as SnippetName[];
    const beforeLength = HERO.before.split("\n").length;

    const [snippets, removed, added, hero, answers] = await Promise.all([
      Promise.all(
        names.map((name) =>
          highlightLines(SNIPPETS[name].code, SNIPPETS[name].lang)
        )
      ),
      highlightLines(DIFF.removed, "tsx"),
      highlightLines(DIFF.added, "tsx"),
      highlightLines(`${HERO.before}\n${HERO.after}`, "tsx"),
      Promise.all(
        HERO_ANSWERS.map(async (answer) => {
          const [line] = await highlightLines(heroAnswerComment(answer), "tsx");
          return line ?? EMPTY_LINE;
        })
      ),
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
        before: hero.slice(0, beforeLength),
        after: hero.slice(beforeLength),
        answers: Object.fromEntries(
          HERO_ANSWERS.map((answer, index) => [answer, answers[index]])
        ) as Record<HeroAnswer, Root>,
      },
    };
  }
);

export type LandingCode = Awaited<ReturnType<typeof getLandingCode>>;
