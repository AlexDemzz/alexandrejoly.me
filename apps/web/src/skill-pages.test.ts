import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { SKILLS } from "@/content";

import { SKILL_PAGES, SKILL_PAGE_NAMES } from "./skill-pages";

describe("skill pages", () => {
  it.each(SKILL_PAGE_NAMES)(
    "lists %s on the home with an Open Graph card",
    (name) => {
      expect(SKILLS.map((skill) => skill.name)).toContain(name);
      expect(
        existsSync(new URL(`../public/og/skills/${name}.png`, import.meta.url))
      ).toBe(true);
    }
  );

  it.each(SKILL_PAGE_NAMES)(
    "opens %s with setup, then prerequisites",
    (name) => {
      expect(
        SKILL_PAGES[name].sections.slice(0, 2).map(({ title }) => title)
      ).toEqual(["Setup", "Prerequisites"]);
    }
  );
});
