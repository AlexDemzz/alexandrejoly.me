import { describe, expect, it } from "vitest";

import { markdownTwinPath, prefersMarkdown } from "./markdown-negotiation";

describe("prefersMarkdown", () => {
  it("is true when the client asks for Markdown only", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
  });

  it("is false for a browser's Accept header", () => {
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      )
    ).toBe(false);
  });

  it("follows the q-values when both types are listed", () => {
    expect(prefersMarkdown("text/markdown, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
  });

  it("keeps HTML when the client accepts anything or sends no header", () => {
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown(null)).toBe(false);
  });

  it("is false when Markdown is explicitly refused", () => {
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
  });

  it("ignores case and parameters", () => {
    expect(prefersMarkdown("Text/Markdown; charset=utf-8")).toBe(true);
  });
});

describe("markdownTwinPath", () => {
  it("maps a .md URL to the page it mirrors", () => {
    expect(markdownTwinPath("/docs/dialog-drawer.md")).toBe(
      "/docs/dialog-drawer"
    );
    expect(markdownTwinPath("/docs.md")).toBe("/docs");
    expect(markdownTwinPath("/index.md")).toBe("/");
  });

  it("leaves other URLs alone", () => {
    expect(markdownTwinPath("/docs/dialog-drawer")).toBeUndefined();
    expect(markdownTwinPath("/r/dialog-drawer.json")).toBeUndefined();
  });
});
