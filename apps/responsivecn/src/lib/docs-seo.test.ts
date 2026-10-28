import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { docsSeo } from "./docs-seo";
import { parseFrontmatter } from "./frontmatter";
import { homeSeo } from "./seo";

const DOCS_DIR = path.join(import.meta.dirname, "../../content/docs");

const docsPages = readdirSync(DOCS_DIR)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => {
    const slug = file.replace(/\.mdx$/u, "");
    const frontmatter = parseFrontmatter(
      readFileSync(path.join(DOCS_DIR, file), "utf-8")
    );
    return docsSeo({
      slugs: slug === "index" ? [] : [slug],
      title: frontmatter.title,
      description: frontmatter.description,
    });
  });

describe("parseFrontmatter", () => {
  it("reads the title and description of an MDX page", () => {
    expect(
      parseFrontmatter(
        "---\ntitle: SheetDrawer\ndescription: An edge-anchored Sheet.\n---\n\nBody"
      )
    ).toEqual({ title: "SheetDrawer", description: "An edge-anchored Sheet." });
  });
});

describe("docsSeo", () => {
  it("names both sides of a pair in its title, after the component", () => {
    const page = docsSeo({
      slugs: ["popover-drawer"],
      title: "PopoverDrawer",
      description: "An anchored Popover.",
    });
    expect(page.title).toBe(
      "PopoverDrawer: shadcn Popover on desktop, Drawer on mobile"
    );
    expect(page.path).toBe("/docs/popover-drawer");
  });

  it("gives every page of the site a unique title that fits a results page", () => {
    const titles = [homeSeo, ...docsPages].map((page) => page.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const title of titles) {
      expect(title.length).toBeLessThanOrEqual(60);
    }
  });

  it("gives every page a unique description that fits a results page", () => {
    const descriptions = [homeSeo, ...docsPages].map(
      (page) => page.description
    );
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const description of descriptions) {
      expect(description.length).toBeGreaterThanOrEqual(70);
      expect(description.length).toBeLessThanOrEqual(160);
    }
  });
});
