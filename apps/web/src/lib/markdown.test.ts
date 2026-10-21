import { describe, expect, it } from "vitest";

import { PROJECTS } from "@/content";
import { INFO_PAGE_SLUGS } from "@/info-pages";
import { REGISTRY_ITEMS } from "@/lib/registry";

import {
  componentMarkdown,
  homeMarkdown,
  infoPageMarkdown,
  llmsTxt,
  markdownFor,
} from "./markdown";

const MARKDOWN_LINK = /\[[^\]]+\]\([^)]+\)/gu;
const TRUST_PAGE_MIN_CHARACTERS = 500;

/** The words a reader sees: headings and link targets stripped. */
const prose = (markdown: string) =>
  markdown
    .replaceAll(/^#+ .*$/gmu, "")
    .replaceAll(/\[(?<text>[^\]]+)\]\([^)]+\)/gu, "$<text>")
    .replaceAll(/\s+/gu, " ")
    .trim();

describe("llmsTxt", () => {
  const lines = llmsTxt().split("\n");

  it("opens with the site name as H1, then a blockquote summary", () => {
    expect(lines[0]).toBe("# Alexandre Joly");
    expect(lines[2]).toMatch(/^> \S/u);
  });

  it("has no heading below H2 and keeps Optional last", () => {
    const headings = lines.filter((line) => line.startsWith("#"));

    expect(headings.slice(1).every((line) => line.startsWith("## "))).toBe(
      true
    );
    expect(headings.at(-1)).toBe("## Optional");
  });

  it("lists every page and component as a link with notes", () => {
    const fileLists = llmsTxt().split("## Pages")[1] ?? "";
    const items = fileLists.split("\n").filter((line) => line.startsWith("- "));

    expect(items.length).toBeGreaterThanOrEqual(
      1 + INFO_PAGE_SLUGS.length + REGISTRY_ITEMS.length
    );
    for (const item of items) {
      expect(item).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)(?:: .+)?$/u);
    }
  });

  it("tells agents when to use the site and how", () => {
    const whenToUse =
      llmsTxt().split("## When to use this site")[1]?.split("\n## ")[0] ?? "";

    expect(whenToUse).toContain(
      "pnpm dlx shadcn@latest add https://alexandrejoly.me/r/<name>.json"
    );
  });
});

describe("homeMarkdown", () => {
  it("links every project", () => {
    const markdown = homeMarkdown();

    for (const project of PROJECTS) {
      expect(markdown).toContain(`[${project.name}](${project.href})`);
    }
  });
});

describe("infoPageMarkdown", () => {
  it.each(INFO_PAGE_SLUGS)(
    "gives /%s enough prose to vouch for the site",
    (slug) => {
      expect(prose(infoPageMarkdown(slug)).length).toBeGreaterThanOrEqual(
        TRUST_PAGE_MIN_CHARACTERS
      );
    }
  );
});

describe("componentMarkdown", () => {
  it("carries the install command, a registry URL and the usage snippet", () => {
    const markdown = componentMarkdown("hint");

    expect(markdown).toContain(
      "pnpm dlx shadcn@latest add @alexandrejoly/hint"
    );
    expect(markdown).toContain(
      "pnpm dlx shadcn@latest add https://alexandrejoly.me/r/hint.json"
    );
    expect(markdown).toContain("```tsx\nimport { Hint, HintContent");
  });
});

describe("markdownFor", () => {
  it("maps every page path, with or without .md", () => {
    for (const path of [
      "/",
      "/index.md",
      "/about",
      "/privacy.md",
      "/contact/",
      "/components/marquee",
    ]) {
      expect(markdownFor(path).status).toBe(200);
    }
  });

  it("reports anything else as missing", () => {
    for (const path of ["/index", "/components", "/about/team", "/x.md"]) {
      expect(markdownFor(path).status).toBe(404);
    }
  });

  it("only links absolute URLs, so agents can follow them anywhere", () => {
    const links = [homeMarkdown(), llmsTxt(), markdownFor("/x").body]
      .join("\n")
      .match(MARKDOWN_LINK);

    for (const link of links ?? []) {
      expect(link).toMatch(/\((?:https:|mailto:)/u);
    }
  });
});
