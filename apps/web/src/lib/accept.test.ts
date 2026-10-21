import { describe, expect, it } from "vitest";

import { prefersMarkdown } from "./accept";

const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

describe("prefersMarkdown", () => {
  it("serves HTML to browsers, wildcards and requests without Accept", () => {
    expect(prefersMarkdown(BROWSER_ACCEPT)).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown("text/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });

  it("serves Markdown when the client asks for it", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("Text/Markdown; charset=utf-8")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html")).toBe(true);
  });

  it("follows q-values", () => {
    expect(prefersMarkdown("text/markdown;q=0.5, text/html")).toBe(false);
    expect(prefersMarkdown("text/html;q=0.5, text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0.9, */*;q=0.1")).toBe(true);
  });

  it("never serves Markdown the client refuses", () => {
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
    expect(prefersMarkdown("text/*, text/markdown;q=0")).toBe(false);
  });
});
