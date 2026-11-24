// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TOAST_PAGE } from "@/content";
import { CreditRuns } from "@/lab/lab-page-heading";
import { extractableText } from "@/lib/extractable-text";

import { DocsHeader } from "./docs-sections";

describe("DocsHeader", () => {
  it("keeps the title and description in the text extractors read without JavaScript", () => {
    const text = extractableText(
      renderToStaticMarkup(
        <DocsHeader
          description={<CreditRuns runs={TOAST_PAGE.credit} />}
          nav={<nav>Alexandre Joly / Lab</nav>}
          title={TOAST_PAGE.title}
        />
      )
    );

    expect(text).toContain(TOAST_PAGE.title);
    for (const run of TOAST_PAGE.credit) {
      expect(text).toContain(typeof run === "string" ? run : run.text);
    }
  });
});
