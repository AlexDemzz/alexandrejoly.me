// @vitest-environment jsdom
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { INFO_PAGE_SLUGS, INFO_PAGES } from "@/info-pages";
import { extractableText } from "@/lib/extractable-text";

import { InfoPageView } from "./info-page";
import { paragraphKey } from "./prose";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children?: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("InfoPageView", () => {
  it.each(INFO_PAGE_SLUGS)(
    "keeps the %s title and intro in the text extractors read without JavaScript",
    (slug) => {
      const { intro, title } = INFO_PAGES[slug];
      const text = extractableText(
        renderToStaticMarkup(<InfoPageView slug={slug} />)
      );

      expect(text).toContain(title);
      for (const paragraph of intro) {
        expect(text).toContain(paragraphKey(paragraph));
      }
    }
  );
});
