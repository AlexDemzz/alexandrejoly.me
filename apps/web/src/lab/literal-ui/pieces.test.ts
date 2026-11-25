import { expect, it } from "vitest";

import { LITERAL_PATH } from "@/lab/experiments";

import { PIECES, SLOT_COUNT } from "./pieces";

it("links each piece to its slug under the family", () => {
  for (const { slug, to } of PIECES) {
    expect(to).toBe(`/${LITERAL_PATH}/${slug}`);
  }
});

it("gives every piece its own slug", () => {
  const slugs = PIECES.map(({ slug }) => slug);

  expect(new Set(slugs).size).toBe(slugs.length);
});

it("has a slot for every piece, in full rows at two columns and at three", () => {
  expect(SLOT_COUNT).toBeGreaterThanOrEqual(PIECES.length);
  expect(SLOT_COUNT % 6).toBe(0);
});
