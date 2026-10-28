import { describe, expect, it } from "vitest";

import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import { PROJECTS } from "@/content";
import { INFO_PAGE_SLUGS } from "@/info-pages";
import { getComponentCode } from "@/lib/component-code";
import { REGISTRY_ITEMS, REGISTRY_ITEM_NAMES } from "@/lib/registry";

import {
  componentMarkdown,
  homeMarkdown,
  infoPageMarkdown,
  llmsTxt,
  markdownFor,
} from "./markdown";

const MARKDOWN_LINK = /\[[^\]]+\]\([^)]+\)/gu;
const TRUST_PAGE_MIN_CHARACTERS = 500;
const LIST_ITEM_INDENT = /^ {3}/gmu;

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
      "pnpm dlx shadcn@latest add @alexandrejoly/<name>"
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
  it("carries the install command, a registry URL and the usage snippet", async () => {
    const markdown = componentMarkdown("hint", await getComponentCode("hint"));

    expect(markdown).toContain(
      "pnpm dlx shadcn@latest add @alexandrejoly/hint"
    );
    expect(markdown).not.toContain("https://alexandrejoly.me/r/hint.json");
    expect(markdown).toContain("```tsx\nimport { Hint, HintContent");
  });

  it.each(REGISTRY_ITEM_NAMES)(
    "carries everything the /components/%s page shows",
    async (name) => {
      const code = await getComponentCode(name);
      const markdown = componentMarkdown(name, code);
      const {
        accessibility = [],
        api,
        demo,
        examples,
        wcag = [],
      } = REGISTRY_DOCS[name];

      expect(markdown).toContain(code.demos[demo.file]?.code);
      // Lines marked `site-only` never reach a reader's copy.
      for (const { code: shown } of Object.values(code.demos)) {
        expect(shown).not.toMatch(/site-only|oxlint-disable/u);
      }
      // The source sits in a list item, indented under its step.
      expect(markdown.replaceAll(LIST_ITEM_INDENT, "")).toContain(
        code.source.code
      );
      for (const example of examples) {
        expect(markdown).toContain(`### ${example.title}`);
        expect(markdown).toContain(example.description);
        expect(markdown).toContain(code.demos[example.file]?.code);
      }
      if (accessibility.length > 0) {
        expect(markdown).toContain("## Accessibility");
      }
      for (const paragraph of accessibility) {
        expect(markdown).toContain(paragraph);
      }
      for (const { href, title } of wcag) {
        expect(markdown).toContain(`[${title}](${href})`);
      }
      for (const part of api) {
        expect(markdown).toContain(`### ${part.name}`);
        expect(markdown).toContain(part.description);
        for (const prop of part.props) {
          expect(markdown).toContain(`| \`${prop.name}\` |`);
        }
      }
    }
  );

  it("says what differs in a browser that lacks a feature", async () => {
    const markdown = componentMarkdown(
      "marquee",
      await getComponentCode("marquee")
    );

    expect(markdown).toContain(
      "> Telling that they fit needs CSS scroll-driven animations. Without that support, the items slide even though they fit."
    );
  });

  it("keeps a pipe in a prop type from splitting its table cell", async () => {
    const markdown = componentMarkdown(
      "marquee",
      await getComponentCode("marquee")
    );

    expect(markdown).toContain('| `"horizontal" \\| "vertical"` |');
  });
});

describe("markdownFor", () => {
  it.each([
    "/",
    "/index.md",
    "/about",
    "/privacy.md",
    "/contact/",
    "/components",
    "/components.md",
    "/components/marquee",
  ])("maps %s, with or without .md", async (path) => {
    await expect(markdownFor(path)).resolves.toMatchObject({ status: 200 });
  });

  it.each(["/index", "/components/nope", "/about/team", "/x.md"])(
    "reports %s as missing",
    async (path) => {
      await expect(markdownFor(path)).resolves.toMatchObject({ status: 404 });
    }
  );

  it("only links absolute URLs, so agents can follow them anywhere", async () => {
    const pages = await Promise.all([
      markdownFor("/x"),
      markdownFor("/components/onboarding"),
    ]);
    const links = [homeMarkdown(), llmsTxt(), ...pages.map((page) => page.body)]
      .join("\n")
      .match(MARKDOWN_LINK);

    for (const link of links ?? []) {
      expect(link).toMatch(/\((?:https:|mailto:)/u);
    }
  });
});
