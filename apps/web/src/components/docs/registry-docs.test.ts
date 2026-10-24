import { expect, it } from "vitest";

import { REGISTRY_ITEM_NAMES } from "@/lib/registry";

import { REGISTRY_DOCS } from "./registry-docs";

// Long enough to fill a result's snippet, short enough that it is not cut.
const SNIPPET_LENGTH = { max: 160, min: 150 };

it.each(REGISTRY_ITEM_NAMES)(
  "fits %s's meta description to a search result's snippet",
  (name) => {
    const { length } = REGISTRY_DOCS[name].metaDescription;

    expect(length).toBeGreaterThanOrEqual(SNIPPET_LENGTH.min);
    expect(length).toBeLessThanOrEqual(SNIPPET_LENGTH.max);
  }
);
