// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ASCII_PAGE, FORMULA1_PAGE, FORMULA_PAGE } from "@/content";
import { extractableText } from "@/lib/extractable-text";

import { LabPageHeading } from "./lab-page-heading";

// A real <Link> needs a mounted router; the breadcrumb is dropped by extractors anyway.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to }: { to: string }) => <a href={to}>{to}</a>,
}));

const creditRuns = (
  credit: typeof FORMULA_PAGE.credit | typeof FORMULA1_PAGE.credit
) => credit.map((run) => (typeof run === "string" ? run : run.text));

describe("LabPageHeading", () => {
  it("keeps the ASCII title in the text extractors read without JavaScript", () => {
    const text = extractableText(
      renderToStaticMarkup(<LabPageHeading title={ASCII_PAGE.title} />)
    );

    expect(text).toContain(ASCII_PAGE.title);
  });

  it.each([
    ["Formula 2030", FORMULA_PAGE],
    ["Ferrari SF-25 Wheel", FORMULA1_PAGE],
  ])(
    "keeps the %s title and credit in the text extractors read without JavaScript",
    (_name, page) => {
      const text = extractableText(
        renderToStaticMarkup(
          <LabPageHeading credit={page.credit} title={page.title} />
        )
      );

      expect(text).toContain(page.title);
      for (const run of creditRuns(page.credit)) {
        expect(text).toContain(run);
      }
    }
  );
});
