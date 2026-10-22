import { describe, expect, it } from "vitest";

import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import { REGISTRY_ITEM_NAMES } from "@/lib/registry";

import { SECTION_IDS, headingIds, slugify } from "./heading-ids";

describe("slugify", () => {
  it("splits component names and drops call parentheses", () => {
    expect(slugify("MarqueeContent")).toBe("marquee-content");
    expect(slugify("useOnboarding()")).toBe("use-onboarding");
    expect(slugify("Pause on hover")).toBe("pause-on-hover");
  });
});

describe("headingIds", () => {
  it.each(REGISTRY_ITEM_NAMES)("gives %s unique ids", (name) => {
    const { api, examples } = headingIds(REGISTRY_DOCS[name]);
    const ids = [...Object.values(SECTION_IDS), ...examples, ...api];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("suffixes an API part whose slug an example took", () => {
    const { api, examples } = headingIds(REGISTRY_DOCS.onboarding);
    expect(examples).toContain("use-onboarding");
    expect(api).toContain("use-onboarding-1");
  });
});
