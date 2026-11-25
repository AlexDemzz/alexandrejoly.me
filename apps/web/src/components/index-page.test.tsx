// @vitest-environment jsdom
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  COMPONENTS_PAGE,
  LAB_PAGE,
  PROJECTS_PAGE,
  SKILLS_PAGE,
} from "@/content";
import { extractableText } from "@/lib/extractable-text";

import { IndexPage } from "./index-page";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children?: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("IndexPage", () => {
  it.each([
    ["components", COMPONENTS_PAGE],
    ["lab", LAB_PAGE],
    ["projects", PROJECTS_PAGE],
    ["skills", SKILLS_PAGE],
  ])(
    "keeps the %s title and intro in the text extractors read without JavaScript",
    (_, page) => {
      const text = extractableText(
        renderToStaticMarkup(
          <IndexPage
            intro={page.intro}
            listTitle={page.listTitle}
            title={page.title}
          >
            <ul />
          </IndexPage>
        )
      );

      expect(text).toContain(page.title);
      expect(text).toContain(page.intro);
    }
  );
});
